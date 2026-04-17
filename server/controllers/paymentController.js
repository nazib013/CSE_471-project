const axios = require('axios');
const Order = require('../models/Order');
const Product = require('../models/Product');

const toNum = (value) => {
  const n = Number(String(value || '').replace(/[^0-9.]/g, ''));
  return Number.isNaN(n) ? 0 : n;
};

async function validateSslPayment(valId) {
  const url =
    `${process.env.SSLCOMMERZ_VALIDATION_API}` +
    `?val_id=${encodeURIComponent(valId)}` +
    `&store_id=${encodeURIComponent(process.env.SSLCOMMERZ_STORE_ID)}` +
    `&store_passwd=${encodeURIComponent(process.env.SSLCOMMERZ_STORE_PASSWORD)}` +
    `&format=json`;

  const response = await axios.get(url);
  return response.data;
}

exports.startOrderPayment = async (req, res) => {
  try {
    const { items, shipping } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'No items provided' });
    }

    if (!shipping || !shipping.name || !shipping.email || !shipping.phone) {
      return res.status(400).json({ message: 'Name, email and phone are required' });
    }

    const productIds = items.map((item) => item.productId);

    const products = await Product.find({
      _id: { $in: productIds },
      isSold: { $ne: true },
    }).populate('sellerId', 'email name');

    const orderItems = items
      .map((item) => {
        const product = products.find((p) => String(p._id) === String(item.productId));
        if (!product) return null;

        return {
          product: product._id,
          name: product.name,
          amount: product.amount,
          quantity: item.quantity || 1,
          imageUrl: product.imageUrl,
          sellerId: product.sellerId ? product.sellerId._id : undefined,
        };
      })
      .filter(Boolean);

    if (orderItems.length === 0) {
      return res.status(400).json({ message: 'No valid unsold products found' });
    }

    const total = orderItems.reduce((sum, item) => {
      return sum + toNum(item.amount) * (item.quantity || 1);
    }, 0);

    if (total < 10) {
      return res.status(400).json({ message: 'Minimum payable amount is 10 BDT' });
    }

    const tranId = `ORDER_${Date.now()}`;

    const order = await Order.create({
      customerId: req.user._id,
      items: orderItems,
      total,
      status: 'pending',
      paymentStatus: 'pending',
      paymentGateway: 'sslcommerz',
      transactionId: tranId,
      shipping,
      deliveryTracking: {
        history: [{ status: 'pending', note: 'Waiting for payment' }],
      },
    });

    const payload = new URLSearchParams({
      store_id: process.env.SSLCOMMERZ_STORE_ID,
      store_passwd: process.env.SSLCOMMERZ_STORE_PASSWORD,
      total_amount: total.toFixed(2),
      currency: 'BDT',
      tran_id: tranId,

      success_url: `${process.env.SERVER_URL}/api/payments/order/success`,
      fail_url: `${process.env.SERVER_URL}/api/payments/order/fail`,
      cancel_url: `${process.env.SERVER_URL}/api/payments/order/cancel`,
      ipn_url: `${process.env.SERVER_URL}/api/payments/order/ipn`,

      cus_name: shipping.name,
      cus_email: shipping.email,
      cus_add1: shipping.address || 'N/A',
      cus_city: shipping.city || 'Dhaka',
      cus_postcode: shipping.postalCode || '1200',
      cus_country: shipping.country || 'Bangladesh',
      cus_phone: shipping.phone,

      shipping_method: 'NO',
      product_name: orderItems.map((item) => item.name).join(', ').slice(0, 255),
      product_category: 'Pet Adoption',
      product_profile: 'physical-goods',

      value_a: String(order._id),
      value_b: String(req.user._id),
    });

    const sslResponse = await axios.post(
      process.env.SSLCOMMERZ_SESSION_API,
      payload.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    if (!sslResponse.data || !sslResponse.data.GatewayPageURL) {
      return res.status(500).json({
        message: 'Failed to create payment session',
        gatewayResponse: sslResponse.data,
      });
    }

    return res.json({
      gatewayUrl: sslResponse.data.GatewayPageURL,
      orderId: order._id,
    });
  } catch (err) {
    console.error('startOrderPayment error:', err.response?.data || err.message);
    return res.status(500).json({ message: 'Payment session creation failed' });
  }
};

exports.orderPaymentSuccess = async (req, res) => {
  try {
    const { val_id, tran_id } = req.body;

    const order = await Order.findOne({ transactionId: tran_id });
    if (!order) {
      return res.redirect(`${process.env.CLIENT_URL}/payment-failed`);
    }

    const validation = await validateSslPayment(val_id);

    const paid =
      validation &&
      validation.status === 'VALIDATED' &&
      Number(validation.amount) === Number(order.total);

    if (!paid) {
      order.paymentStatus = 'failed';
      order.gatewayData = validation;
      await order.save();

      return res.redirect(`${process.env.CLIENT_URL}/payment-failed`);
    }

    order.paymentStatus = 'paid';
    order.status = 'confirmed';
    order.valId = val_id;
    order.gatewayData = validation;

    if (!order.deliveryTracking) {
      order.deliveryTracking = { history: [] };
    }
    if (!order.deliveryTracking.history) {
      order.deliveryTracking.history = [];
    }

    order.deliveryTracking.history.push({
      status: 'confirmed',
      note: 'Payment verified successfully',
    });

    await order.save();

    for (const item of order.items) {
      await Product.updateOne(
        { _id: item.product, isSold: { $ne: true } },
        {
          $set: {
            isSold: true,
            soldAt: new Date(),
            buyerId: order.customerId,
          },
        }
      );
    }

    return res.redirect(`${process.env.CLIENT_URL}/payment-success/${order._id}`);
  } catch (err) {
    console.error('orderPaymentSuccess error:', err.response?.data || err.message);
    return res.redirect(`${process.env.CLIENT_URL}/payment-failed`);
  }
};

exports.orderPaymentFail = async (req, res) => {
  try {
    const { tran_id } = req.body;

    await Order.updateOne(
      { transactionId: tran_id },
      {
        $set: {
          paymentStatus: 'failed',
        },
      }
    );
  } catch (err) {
    console.error('orderPaymentFail error:', err.message);
  }

  return res.redirect(`${process.env.CLIENT_URL}/payment-failed`);
};

exports.orderPaymentCancel = async (req, res) => {
  try {
    const { tran_id } = req.body;

    await Order.updateOne(
      { transactionId: tran_id },
      {
        $set: {
          paymentStatus: 'cancelled',
          status: 'cancelled',
        },
      }
    );
  } catch (err) {
    console.error('orderPaymentCancel error:', err.message);
  }

  return res.redirect(`${process.env.CLIENT_URL}/payment-cancelled`);
};

exports.orderPaymentIpn = async (req, res) => {
  return res.status(200).send('IPN received');
};