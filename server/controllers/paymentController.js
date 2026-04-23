const axios = require('axios');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Donation = require('../models/Donation');

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

    console.log('SSLCommerz Response Status:', sslResponse.status);
    console.log('SSLCommerz Response Data:', JSON.stringify(sslResponse.data, null, 2));

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
  try {
    const { val_id, tran_id } = req.body;

    if (!val_id || !tran_id) {
      return res.status(400).json({ message: 'Missing val_id or tran_id' });
    }

    const order = await Order.findOne({ transactionId: tran_id });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const validation = await validateSslPayment(val_id);

    const paid =
      validation &&
      validation.status === 'VALIDATED' &&
      Number(validation.amount) === Number(order.total);

    if (paid) {
      order.paymentStatus = 'paid';
      order.status = 'confirmed';
      order.valId = val_id;
      order.gatewayData = validation;

      if (!order.deliveryTracking) order.deliveryTracking = { history: [] };
      if (!order.deliveryTracking.history) order.deliveryTracking.history = [];

      const hasConfirmedHistory = order.deliveryTracking.history.some(
        (item) => item.status === 'confirmed'
      );

      if (!hasConfirmedHistory) {
        order.deliveryTracking.history.push({
          status: 'confirmed',
          note: 'Payment confirmed by IPN',
        });
      }

      await order.save();
    }

    return res.status(200).json({ message: 'IPN received' });
  } catch (err) {
    console.error('orderPaymentIpn error:', err.response?.data || err.message);
    return res.status(500).json({ message: 'IPN processing failed' });
  }
};

exports.startDonationPayment = async (req, res) => {
  try {
    const { amount, purpose, message, donor } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ message: 'Please provide a valid donation amount.' });
    }

    if (Number(amount) < 10) {
      return res.status(400).json({ message: 'Minimum donation amount is 10 BDT.' });
    }

    if (!donor || !donor.name || !donor.email || !donor.phone) {
      return res.status(400).json({ message: 'Name, email and phone are required.' });
    }

    const tranId = `DONATION_${Date.now()}`;

    const donation = await Donation.create({
      userId: req.user._id,
      donor: {
        name: donor.name,
        email: donor.email,
        phone: donor.phone,
      },
      amount: Number(amount),
      purpose: purpose?.trim() || 'General Donation',
      message: message?.trim() || '',
      paymentMethod: 'sslcommerz',
      paymentGateway: 'sslcommerz',
      transactionId: tranId,
      status: 'pending',
    });

    const payload = new URLSearchParams({
      store_id: process.env.SSLCOMMERZ_STORE_ID,
      store_passwd: process.env.SSLCOMMERZ_STORE_PASSWORD,
      total_amount: Number(amount).toFixed(2),
      currency: 'BDT',
      tran_id: tranId,

      success_url: `${process.env.SERVER_URL}/api/payments/donation/success`,
      fail_url: `${process.env.SERVER_URL}/api/payments/donation/fail`,
      cancel_url: `${process.env.SERVER_URL}/api/payments/donation/cancel`,
      ipn_url: `${process.env.SERVER_URL}/api/payments/donation/ipn`,

      cus_name: donor.name,
      cus_email: donor.email,
      cus_add1: 'Donation',
      cus_city: 'Dhaka',
      cus_postcode: '1200',
      cus_country: 'Bangladesh',
      cus_phone: donor.phone,

      shipping_method: 'NO',
      product_name: (purpose?.trim() || 'General Donation').slice(0, 255),
      product_category: 'Donation',
      product_profile: 'non-physical-goods',

      value_a: String(donation._id),
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

<<<<<<< HEAD
    console.log('SSLCommerz Response Status:', sslResponse.status);
    console.log('SSLCommerz Response Data:', JSON.stringify(sslResponse.data, null, 2));

=======
>>>>>>> d915b9ccd4cb6385b3fbc6fee4459447cfb27c06
    if (!sslResponse.data || !sslResponse.data.GatewayPageURL) {
      await Donation.findByIdAndUpdate(donation._id, {
        $set: {
          status: 'failed',
        },
      });

      return res.status(500).json({
        message: 'Failed to create donation payment session',
        gatewayResponse: sslResponse.data,
      });
    }

    return res.json({
      gatewayUrl: sslResponse.data.GatewayPageURL,
      donationId: donation._id,
    });
  } catch (err) {
    console.error('startDonationPayment error:', err.response?.data || err.message);
    return res.status(500).json({ message: 'Donation payment session creation failed' });
  }
};

exports.donationPaymentSuccess = async (req, res) => {
  try {
    const { val_id, tran_id } = req.body;

    const donation = await Donation.findOne({ transactionId: tran_id });
    if (!donation) {
      return res.redirect(`${process.env.CLIENT_URL}/donation-payment-failed`);
    }

    const validation = await validateSslPayment(val_id);

    const paid =
      validation &&
      validation.status === 'VALIDATED' &&
      Number(validation.amount) === Number(donation.amount);

    if (!paid) {
      donation.status = 'failed';
      donation.gatewayData = validation;
      await donation.save();

      return res.redirect(`${process.env.CLIENT_URL}/donation-payment-failed`);
    }

    donation.status = 'completed';
    donation.valId = val_id;
    donation.gatewayData = validation;
    await donation.save();

    return res.redirect(`${process.env.CLIENT_URL}/donation-payment-success/${donation._id}`);
  } catch (err) {
    console.error('donationPaymentSuccess error:', err.response?.data || err.message);
    return res.redirect(`${process.env.CLIENT_URL}/donation-payment-failed`);
  }
};

exports.donationPaymentFail = async (req, res) => {
  try {
    const { tran_id } = req.body;

    await Donation.updateOne(
      { transactionId: tran_id },
      {
        $set: {
          status: 'failed',
        },
      }
    );
  } catch (err) {
    console.error('donationPaymentFail error:', err.message);
  }

  return res.redirect(`${process.env.CLIENT_URL}/donation-payment-failed`);
};

exports.donationPaymentCancel = async (req, res) => {
  try {
    const { tran_id } = req.body;

    await Donation.updateOne(
      { transactionId: tran_id },
      {
        $set: {
          status: 'cancelled',
        },
      }
    );
  } catch (err) {
    console.error('donationPaymentCancel error:', err.message);
  }

  return res.redirect(`${process.env.CLIENT_URL}/donation-payment-cancelled`);
};

exports.donationPaymentIpn = async (req, res) => {
  try {
    const { val_id, tran_id } = req.body;

    if (!val_id || !tran_id) {
      return res.status(400).json({ message: 'Missing val_id or tran_id' });
    }

    const donation = await Donation.findOne({ transactionId: tran_id });

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    const validation = await validateSslPayment(val_id);

    const paid =
      validation &&
      validation.status === 'VALIDATED' &&
      Number(validation.amount) === Number(donation.amount);

    if (paid) {
      donation.status = 'completed';
      donation.valId = val_id;
      donation.gatewayData = validation;
      await donation.save();
    }

    return res.status(200).json({ message: 'Donation IPN received' });
  } catch (err) {
    console.error('donationPaymentIpn error:', err.response?.data || err.message);
    return res.status(500).json({ message: 'Donation IPN processing failed' });
  }
<<<<<<< HEAD
};
=======
};
>>>>>>> d915b9ccd4cb6385b3fbc6fee4459447cfb27c06
