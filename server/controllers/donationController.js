const Donation = require('../models/Donation');
const ItemDonation = require('../models/ItemDonation');
const { aiCategorize } = require('../utils/categorizer');

// ─────────────────────────────────────────────
// 1. MONEY: Create (Manual/Legacy)
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
// 8. ITEMS: Create (AI Categorized)
// ─────────────────────────────────────────────
exports.createItemDonation = async (req, res) => {
  console.log("!!! AI CATEGORIZATION STARTED !!!");
  console.log("Data received:", req.body);
  
  try {
    const { title, description } = req.body;
    
    // Use AI Categorizer utility
    const finalCategory = await aiCategorize(title, description);

    console.log("Final Decision:", finalCategory);

    const itemDonation = await ItemDonation.create({
      userId: req.user._id,
      title,
      description,
      category: finalCategory,
    });

    res.status(201).json(itemDonation);
  } catch (err) {
    console.error("Critical error:", err);
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
    res.status(500).json({ message: 'Server error' });
  }
};
