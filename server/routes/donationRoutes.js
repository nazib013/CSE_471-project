const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  getMyDonations,
  getAllDonations,
  getDonationSummary,
  updateDonationStatus,
  deleteDonation,
  getDonationById,
} = require('../controllers/donationController');

router.get('/mine', authMiddleware, getMyDonations);
router.get('/summary/admin', authMiddleware, getDonationSummary);
router.get('/:id', authMiddleware, getDonationById);
router.get('/', authMiddleware, getAllDonations);
router.patch('/:id/status', authMiddleware, updateDonationStatus);
router.delete('/:id', authMiddleware, deleteDonation);

module.exports = router;