const Request = require('../models/Request');

const createRequest = async (req, res) => {
  try {
    const { itemNeeded, reason, urgency } = req.body;
    const newRequest = await Request.create({
      userId: req.user._id, // Tied to the logged-in user
      itemNeeded,
      reason,
      urgency
    });
    res.status(201).json(newRequest);
  } catch (err) {
    res.status(500).json({ message: 'Error creating request', error: err.message });
  }
};

const getMyRequests = async (req, res) => {
  try {
    const requests = await Request.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { createRequest, getMyRequests };