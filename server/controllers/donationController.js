const Donation = require('../models/Donation');
const ItemDonation = require('../models/ItemDonation');
const axios = require('axios');

// Helper function to create a pause/delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ─────────────────────────────────────────────
// 1. MONEY: Create
// ─────────────────────────────────────────────
exports.createDonation = async (req, res) => {
  try {
    const { amount, purpose, message } = req.body;
    const donation = await Donation.create({
      userId: req.user._id,
      amount: Number(amount),
      purpose: purpose || 'General Donation',
      message: message || '',
      status: 'completed',
    });
    res.status(201).json(donation);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────
// 2. MONEY: Get User's History
// ─────────────────────────────────────────────
exports.getMyDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(donations);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────
// 3. MONEY: Get All Donations (Admin)
// ─────────────────────────────────────────────
exports.getAllDonations = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const donations = await Donation.find()
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 });

    res.json(donations);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────
// 4. MONEY: Get Summary (Admin)
// ─────────────────────────────────────────────
exports.getDonationSummary = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const donations = await Donation.find();

    const totalDonations = donations.length;
    const completedDonations = donations.filter((d) => d.status === 'completed').length;
    const pendingDonations = donations.filter((d) => d.status === 'pending').length;
    const failedDonations = donations.filter((d) => d.status === 'failed').length;
    const cancelledDonations = donations.filter((d) => d.status === 'cancelled').length;

    const totalAmount = donations
      .filter((d) => d.status === 'completed')
      .reduce((sum, d) => sum + Number(d.amount || 0), 0);

    res.json({
      totalDonations,
      completedDonations,
      pendingDonations,
      failedDonations,
      cancelledDonations,
      totalAmount,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────
// 5. MONEY: Get By ID
// ─────────────────────────────────────────────
exports.getDonationById = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id).populate('userId', 'name email');

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    const isOwner = String(donation.userId?._id || donation.userId) === String(req.user._id);
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.json(donation);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────
// 6. MONEY: Update Status (Admin)
// ─────────────────────────────────────────────
exports.updateDonationStatus = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { status } = req.body;

    if (!['pending', 'completed', 'failed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    donation.status = status;
    await donation.save();

    const populatedDonation = await Donation.findById(donation._id).populate('userId', 'name email role');

    res.json(populatedDonation);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────
// 7. MONEY: Delete (Admin)
// ─────────────────────────────────────────────
exports.deleteDonation = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    await Donation.findByIdAndDelete(req.params.id);

    res.json({ message: 'Donation deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────
// 8. ITEMS: Create (AI Categorized with Retry)
// ─────────────────────────────────────────────
exports.createItemDonation = async (req, res) => {
  try {
    const { title, description } = req.body;
    let aiCategory = 'Other'; 

    const hfToken = process.env.HUGGING_FACE_TOKEN;

    if (hfToken) {
      let retries = 3; // We will try 3 times before giving up
      let delayTime = 5000; // Wait 5 seconds between tries

      while (retries > 0) {
        try {
          const response = await axios.post(
            "https://api-inference.huggingface.co/models/facebook/bart-large-mnli",
            {
              inputs: `Donation: ${title}. Info: ${description}`,
              parameters: { 
                candidate_labels: ["animal food", "medical supplies", "pet accessories", "other"],
                hypothesis_template: "This item is {}."
              }
            },
            { 
              headers: { Authorization: `Bearer ${hfToken}` },
              timeout: 20000 // Give it plenty of time
            }
          );

          // If the AI successfully replies, map the category and BREAK the loop
          if (response.data && response.data.labels && response.data.labels.length > 0) {
            const topLabel = response.data.labels[0];
            
            const labelMapping = {
              "animal food": "Food",
              "medical supplies": "Medicine",
              "pet accessories": "Accessories",
              "other": "Other"
            };
            
            aiCategory = labelMapping[topLabel] || 'Other';
            console.log(`✅ AI Successfully Categorized as: ${aiCategory}`);
            break; // Success! Exit the retry loop.
          }
          
        } catch (aiError) {
          // If the model is sleeping (503 error), wait and try again
          if (aiError.response && aiError.response.status === 503) {
            console.log(`⏳ AI is asleep. Waiting 5 seconds... (${retries - 1} retries left)`);
            await delay(delayTime);
            retries--; // Reduce retry count
          } else {
            // If it's a different error (like a bad API key), log it and break
            console.error("❌ AI Error:", aiError.response?.status || aiError.message);
            break; 
          }
        }
      }
    } else {
      console.log("⚠️ No Hugging Face token found in .env");
    }

    // Save the item to the database with the AI category (or "Other" if it ultimately failed)
    const itemDonation = await ItemDonation.create({
      userId: req.user._id,
      title,
      description,
      category: aiCategory
    });

    res.status(201).json(itemDonation);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────
// 9. ITEMS: Get All (Community)
// ─────────────────────────────────────────────
exports.getItemDonations = async (req, res) => {
  try {
    const items = await ItemDonation.find().populate('userId', 'name').sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────
// 10. ITEMS: Get User's History
// ─────────────────────────────────────────────
exports.getMyItemDonations = async (req, res) => {
  try {
    const items = await ItemDonation.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message }); // <-- Fixed this block
  }
};