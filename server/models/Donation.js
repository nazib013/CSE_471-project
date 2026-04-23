const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    donor: {
      name: { type: String, trim: true, default: '' },
      email: { type: String, trim: true, default: '' },
      phone: { type: String, trim: true, default: '' },
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    purpose: {
      type: String,
      default: 'General Donation',
      trim: true,
    },

    message: {
      type: String,
      default: '',
      trim: true,
      maxlength: 500,
    },

    paymentMethod: {
      type: String,
      default: 'sslcommerz',
    },

    paymentGateway: {
      type: String,
      default: 'sslcommerz',
    },

    transactionId: {
      type: String,
      default: '',
    },

    valId: {
      type: String,
      default: '',
    },

    gatewayData: mongoose.Schema.Types.Mixed,

    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Donation', DonationSchema);
