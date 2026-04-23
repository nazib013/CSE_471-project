const express = require('express');
const router = express.Router();
const { 
  createRequest, 
  getMyRequests, 
  getAllRequests, 
  approveRequest, 
  fulfillRequest 
} = require('../controllers/requestController');

const authMiddleware = require('../middleware/authMiddleware');
const protect = authMiddleware.protect || authMiddleware; 

// Public/User Routes
router.get('/all', getAllRequests);
router.get('/my', protect, getMyRequests);
router.post('/', protect, createRequest);

// ADMIN ACTIONS (The 404 happens because these lines were missing)
router.patch('/:id/approve', protect, approveRequest);
router.patch('/:id/fulfill', protect, fulfillRequest);

module.exports = router;