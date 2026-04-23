const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    default: 'customer' 
  },
  // 1. ADDED: phone field
  phone: { 
    type: String,
    default: ''
  },
  // 2. ADDED: address field
  address: { 
    type: String,
    default: ''
  },
  // 3. ADDED: additionalInfo array for the custom dynamic fields
  additionalInfo: [
    {
      label: { type: String },
      value: { type: String }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);