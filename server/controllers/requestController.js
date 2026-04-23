const Request = require('../models/Request');

const createRequest = async (req, res) => {
  try {
    const { itemNeeded, reason, urgency } = req.body;
    const newRequest = await Request.create({
      userId: req.user._id,
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

const getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find().populate('userId', 'name').sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Admin: Set status to 'approved' (Active)
const approveRequest = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    
    const request = await Request.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );
    
    if (!request) return res.status(404).json({ message: 'Request not found' });
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Admin: Set status to 'fulfilled' (History)
const fulfillRequest = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

    const request = await Request.findByIdAndUpdate(
      req.params.id,
      { status: 'fulfilled' },
      { new: true }
    );

    if (!request) return res.status(404).json({ message: 'Request not found' });
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { 
  createRequest, 
  getMyRequests, 
  getAllRequests, 
  approveRequest, 
  fulfillRequest 
};
