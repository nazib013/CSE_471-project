const express = require('express');
const router = express.Router();
const { createRequest, getMyRequests } = require('../controllers/requestController');

// Safety check for middleware import
const authMiddleware = require('../middleware/authMiddleware');
const protect = authMiddleware.protect || authMiddleware; 

router.post('/', protect, createRequest);
router.get('/my', protect, getMyRequests);

module.exports = router;