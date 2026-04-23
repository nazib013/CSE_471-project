const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const paymentController = require('../controllers/paymentController');

// ── ORDERS ──────────────────────────────────────────────────────────────────

// User starts payment session
router.post('/order/start', auth, paymentController.startOrderPayment);

// Gateway callbacks (Public)
router.post('/order/success', paymentController.orderPaymentSuccess);
router.post('/order/fail', paymentController.orderPaymentFail);
router.post('/order/cancel', paymentController.orderPaymentCancel);
router.post('/order/ipn', paymentController.orderPaymentIpn);

// ── DONATIONS ───────────────────────────────────────────────────────────────

// User starts donation payment session
router.post('/donation/start', auth, paymentController.startDonationPayment);

// Gateway callbacks (Public)
router.post('/donation/success', paymentController.donationPaymentSuccess);
router.post('/donation/fail', paymentController.donationPaymentFail);
router.post('/donation/cancel', paymentController.donationPaymentCancel);
router.post('/donation/ipn', paymentController.donationPaymentIpn);

module.exports = router;
