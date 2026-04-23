const express = require('express');
const router = express.Router();
<<<<<<< HEAD
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
=======
const { createRequest, getMyRequests } = require('../controllers/requestController');

// Safety check for middleware import
const authMiddleware = require('../middleware/authMiddleware');
const protect = authMiddleware.protect || authMiddleware; 

router.post('/', protect, createRequest);
router.get('/my', protect, getMyRequests);
>>>>>>> d915b9ccd4cb6385b3fbc6fee4459447cfb27c06

module.exports = router;