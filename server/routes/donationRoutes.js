const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const {
  createDonation,
=======
const { 
  createDonation, 
>>>>>>> d915b9ccd4cb6385b3fbc6fee4459447cfb27c06
  getMyDonations,
  getAllDonations,
  getDonationSummary,
  getDonationById,
  updateDonationStatus,
  deleteDonation,
<<<<<<< HEAD
  createItemDonation,
  getItemDonations,
  getMyItemDonations,
} = require('../controllers/donationController');

// FIX: Bulletproof import for protect middleware
const authMiddleware = require('../middleware/authMiddleware');
const protect = authMiddleware.protect || authMiddleware;
=======
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
>>>>>>> d915b9ccd4cb6385b3fbc6fee4459447cfb27c06

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
