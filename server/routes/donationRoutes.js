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

// FIX: Bulletproof import for protect middleware
const authMiddleware = require('../middleware/authMiddleware');
const protect = authMiddleware.protect || authMiddleware;

// ── MONEY ROUTES ───────────────────────────────────────────────────────────

// Admin: Get summary statistics (Specific route first)
router.get('/summary/admin', protect, getDonationSummary);

// Admin: Get all donation records
router.get('/all/admin', protect, getAllDonations);

// Create a simple record (manual)
router.post('/', protect, createDonation);

// Get my own donation records
router.get('/', protect, getMyDonations);

// ── ITEM ROUTES ────────────────────────────────────────────────────────────

// Get all donated items (Community view - Specific route)
router.get('/items', getItemDonations);

// Get my own item donations (Specific route)
router.get('/my/items', protect, getMyItemDonations);

// Create an item donation (AI categorized)
router.post('/item', protect, createItemDonation);

// ── WILDCARD ROUTES (ALWAYS AT BOTTOM) ────────────────────────────────────

// Get single donation (by owner or admin)
router.get('/:id', protect, getDonationById);

// Admin: Update status
router.patch('/:id/status', protect, updateDonationStatus);

// Admin: Delete record
router.delete('/:id', protect, deleteDonation);

module.exports = router;
