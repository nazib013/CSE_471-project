const express = require('express');
const router = express.Router();
const { 
  createDonation, 
  getMyDonations, 
  createItemDonation, 
  getItemDonations,
  getMyItemDonations
} = require('../controllers/donationController');

// FIX: Bulletproof import for protect middleware
const authMiddleware = require('../middleware/authMiddleware');
const protect = authMiddleware.protect || authMiddleware; 

// Money Routes
router.post('/', protect, createDonation); 
router.get('/my-donations', protect, getMyDonations);

// Item Routes
router.post('/items', protect, createItemDonation); 
router.get('/items', protect, getItemDonations); 
router.get('/my-items', protect, getMyItemDonations); 

module.exports = router;