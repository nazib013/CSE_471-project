const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  createDonation,
  getMyDonations,
  getAllDonations,
  getDonationSummary,
} = require('../controllers/donationController');

router.post('/', authMiddleware, createDonation);
router.get('/mine', authMiddleware, getMyDonations);
router.get('/', authMiddleware, getAllDonations);
router.get('/summary/admin', authMiddleware, getDonationSummary);

module.exports = router;