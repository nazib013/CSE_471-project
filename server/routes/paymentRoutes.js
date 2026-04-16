const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  startOrderPayment,
  orderPaymentSuccess,
  orderPaymentFail,
  orderPaymentCancel,
  orderPaymentIpn,
} = require('../controllers/paymentController');

router.post('/start-order', authMiddleware, startOrderPayment);

router.post('/order/success', orderPaymentSuccess);
router.post('/order/fail', orderPaymentFail);
router.post('/order/cancel', orderPaymentCancel);
router.post('/order/ipn', orderPaymentIpn);

module.exports = router;