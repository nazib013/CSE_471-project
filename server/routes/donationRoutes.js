const express = require('express');
const router = express.Router();
const { 
  createDonation, 
  getMyDonations,
  getAllDonations,
  getDonationSummary,
  getDonationById,
  updateDonationStatus,
  deleteDonation,
  createItemDonation, 
  getItemDonations,
  getMyItemDonations
} = require('../controllers/donationController');

const authMiddleware = require('../middleware/authMiddleware');
const protect = authMiddleware.protect || authMiddleware; 

// ⚠️ IMPORTANT: specific routes MUST come before /:id
router.get('/summary/admin', protect, getDonationSummary);  // ← fixes 404
router.get('/my-donations', protect, getMyDonations);
router.get('/my-items', protect, getMyItemDonations);
router.get('/', protect, getAllDonations);                   // ← fixes 404

router.post('/', protect, createDonation);
router.patch('/:id/status', protect, updateDonationStatus);
router.delete('/:id', protect, deleteDonation);
router.get('/:id', protect, getDonationById);

// Item Routes
router.post('/items', protect, createItemDonation); 
router.get('/items', protect, getItemDonations); 

module.exports = router;