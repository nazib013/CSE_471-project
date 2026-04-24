const express = require('express');
const router = express.Router();

const {
  createRequest,
  getMyRequests,
  getAllRequests,
  approveRequest,
  fulfillRequest,
} = require('../controllers/requestController');

const authMiddleware = require('../middleware/authMiddleware');
const protect = authMiddleware.protect || authMiddleware;

// Requests
router.get('/all', protect, getAllRequests);
router.get('/my', protect, getMyRequests);
router.post('/', protect, createRequest);

// Admin actions
router.patch('/:id/approve', protect, approveRequest);
router.patch('/:id/fulfill', protect, fulfillRequest);

module.exports = router;