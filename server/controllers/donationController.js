const Donation = require('../models/Donation');
const ItemDonation = require('../models/ItemDonation');

// 1. Create Donation
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

// 2. Get My Donations
exports.getMyDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(donations);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// 3. Get All Donations (Admin)
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

// 4. Summary
exports.getDonationSummary = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const donations = await Donation.find();

    const totalDonations = donations.length;
    const completedDonations = donations.filter(d => d.status === 'completed').length;
    const pendingDonations = donations.filter(d => d.status === 'pending').length;
    const failedDonations = donations.filter(d => d.status === 'failed').length;
    const cancelledDonations = donations.filter(d => d.status === 'cancelled').length;

    const totalAmount = donations
      .filter(d => d.status === 'completed')
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

// 5. Get by ID
exports.getDonationById = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id).populate('userId', 'name email');

    if (!donation) return res.status(404).json({ message: 'Donation not found' });

    const isOwner = String(donation.userId?._id) === String(req.user._id);
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.json(donation);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// 6. Update Status
exports.updateDonationStatus = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { status } = req.body;

    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: 'Not found' });

    donation.status = status;
    await donation.save();

    res.json(donation);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// 7. Delete
exports.deleteDonation = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await Donation.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// 8. Create Item Donation
exports.createItemDonation = async (req, res) => {
  try {
    const { title, description } = req.body;

    const item = await ItemDonation.create({
      userId: req.user._id,
      title,
      description,
      category: 'Other',
    });

    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// 9. Get All Items
exports.getItemDonations = async (req, res) => {
  try {
    const items = await ItemDonation.find().populate('userId', 'name').sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// 10. Get My Items
exports.getMyItemDonations = async (req, res) => {
  try {
    const items = await ItemDonation.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};