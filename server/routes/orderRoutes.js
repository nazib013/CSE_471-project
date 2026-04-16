const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { createOrder, getMyOrders, getOrderById, updateOrderStatus, cancelOrder } = require('../controllers/orderController');

// Customer endpoints
router.post('/', authMiddleware, createOrder);
router.get('/mine', authMiddleware, getMyOrders);
router.get('/:id', authMiddleware, getOrderById);
router.post('/:id/cancel', authMiddleware, cancelOrder);

// Admin or seller could update status; for now, allow admin
const allowAdmin = (req, res, next) => {
  if (req.user?.role === 'admin') return next();
  return res.status(403).json({ message: 'Forbidden' });
};

// Admin: get all orders
router.get('/', authMiddleware, allowAdmin, async (req, res) => {
  try {
    const Order = require('../models/Order');

    const orders = await Order.find()
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error(err); // 👈 VERY IMPORTANT (so you see real error)
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});
router.patch('/:id/status', authMiddleware, allowAdmin, updateOrderStatus);

module.exports = router;
