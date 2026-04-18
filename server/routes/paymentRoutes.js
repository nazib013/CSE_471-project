const express = require('express');
const router = express.Router();
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

router.post('/order/success', orderPaymentSuccess);
router.post('/order/fail', orderPaymentFail);
router.post('/order/cancel', orderPaymentCancel);
router.post('/order/ipn', orderPaymentIpn);

router.post('/donation/success', donationPaymentSuccess);
router.post('/donation/fail', donationPaymentFail);
router.post('/donation/cancel', donationPaymentCancel);
router.post('/donation/ipn', donationPaymentIpn);

module.exports = router;