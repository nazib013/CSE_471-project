const Donation = require('../models/Donation');

exports.createDonation = async (req, res) => {
  try {
    const { amount, purpose, message } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ message: 'Please provide a valid donation amount.' });
    }

    const donation = await Donation.create({
      userId: req.user._id,
      amount: Number(amount),
      purpose: purpose?.trim() || 'General Donation',
      message: message?.trim() || '',
      paymentMethod: 'manual',
      status: 'completed',
    });

    const populatedDonation = await Donation.findById(donation._id).populate('userId', 'name email');

    res.status(201).json(populatedDonation);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getMyDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.json(donations);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getAllDonations = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const donations = await Donation.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json(donations);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getDonationSummary = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const donations = await Donation.find();

    const totalAmount = donations.reduce((sum, d) => sum + Number(d.amount || 0), 0);

    res.json({
      totalDonations: donations.length,
      totalAmount,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};