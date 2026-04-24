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
  getMyItemDonations,
} = require('../controllers/donationController');

const authMiddleware = require('../middleware/authMiddleware');
const protect = authMiddleware.protect || authMiddleware;

// Admin routes
router.get('/summary/admin', protect, getDonationSummary);
router.get('/all/admin', protect, getAllDonations);

// My donation routes
router.get('/my/items', protect, getMyItemDonations);
router.get('/my-donations', protect, getMyDonations);
router.get('/my-items', protect, getMyItemDonations);

// Item donation routes
router.get('/items', getItemDonations);
router.post('/items', protect, createItemDonation);
router.post('/item', protect, createItemDonation);

// Money donation routes
router.post('/', protect, createDonation);
router.get('/', protect, getMyDonations);

// Single donation routes
router.get('/:id', protect, getDonationById);
router.patch('/:id/status', protect, updateDonationStatus);
router.delete('/:id', protect, deleteDonation);

module.exports = router;