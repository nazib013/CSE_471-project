const Complaint = require('../models/Complaint');
const User = require('../models/User');

exports.submitComplaint = async (req, res) => {
  try {
    const complaint = new Complaint({
      userId: req.user._id,
      message: req.body.message
    });
    await complaint.save();
    res.status(201).json({ message: 'Complaint submitted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find().populate('userId', 'name email');
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
