const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const auth = require('../middleware/authMiddleware');
const paymentController = require('../controllers/paymentController');

// ── ORDERS ──────────────────────────────────────────────────────────────────
=======
const authMiddleware = require('../middleware/authMiddleware');
const {
  startOrderPayment,
  orderPaymentSuccess,
  orderPaymentFail,
  orderPaymentCancel,
  orderPaymentIpn,
  startDonationPayment,
  donationPaymentSuccess,
  donationPaymentFail,
  donationPaymentCancel,
  donationPaymentIpn,
} = require('../controllers/paymentController');

router.post('/start-order', authMiddleware, startOrderPayment);
router.post('/start-donation', authMiddleware, startDonationPayment);
>>>>>>> d915b9ccd4cb6385b3fbc6fee4459447cfb27c06

// User starts payment session
router.post('/order/start', auth, paymentController.startOrderPayment);

<<<<<<< HEAD
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
=======
router.post('/donation/success', donationPaymentSuccess);
router.post('/donation/fail', donationPaymentFail);
router.post('/donation/cancel', donationPaymentCancel);
router.post('/donation/ipn', donationPaymentIpn);

module.exports = router;
>>>>>>> d915b9ccd4cb6385b3fbc6fee4459447cfb27c06
