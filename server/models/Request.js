const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    itemNeeded: { type: String, required: true }, 
    reason: { type: String, required: true }, 
    urgency: { 
      type: String, 
      enum: ['Low', 'Medium', 'High'], 
      default: 'Medium' 
    },
    status: { 
      type: String, 
      enum: ['pending', 'approved', 'fulfilled', 'rejected'], 
      default: 'pending' 
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Request', RequestSchema);