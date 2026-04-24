const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const protect = authMiddleware.protect || authMiddleware;

const paymentController = require('../controllers/paymentController');

// Order payment
router.post('/order/start', protect, paymentController.startOrderPayment);
router.post('/start-order', protect, paymentController.startOrderPayment);

// Order gateway callbacks
router.post('/order/success', paymentController.orderPaymentSuccess);
router.post('/order/fail', paymentController.orderPaymentFail);
router.post('/order/cancel', paymentController.orderPaymentCancel);
router.post('/order/ipn', paymentController.orderPaymentIpn);

// Donation payment
router.post('/donation/start', protect, paymentController.startDonationPayment);
router.post('/start-donation', protect, paymentController.startDonationPayment);

// Donation gateway callbacks
router.post('/donation/success', paymentController.donationPaymentSuccess);
router.post('/donation/fail', paymentController.donationPaymentFail);
router.post('/donation/cancel', paymentController.donationPaymentCancel);
router.post('/donation/ipn', paymentController.donationPaymentIpn);

module.exports = router;