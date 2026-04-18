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
// 3. ITEMS: Create (AI Categorized with Retry)
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
// 4. ITEMS: Get All (Community)
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
// 5. ITEMS: Get User's History
// ─────────────────────────────────────────────
exports.getMyItemDonations = async (req, res) => {
  try {
    const items = await ItemDonation.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};