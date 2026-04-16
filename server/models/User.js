const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'seller', 'admin'], default: 'customer' },
  
  // --- ADDED FOR TASK 1: Extra Registration Info ---
  // We can add specific fields you want to ask during signup.
  // Set required: true if they MUST fill this out to register.
  phone: { type: String, required: false }, 
  address: { type: String, required: false },

  // --- ADDED FOR TASK 2: Dynamic "+ Add" Profile Info ---
  // This allows users to add custom fields to their profile later.
  // It saves data as an array of objects, e.g., [{ label: "Hobby", value: "Reading" }]
  additionalInfo: [{
    label: { type: String }, 
    value: { type: String }  
  }]
  
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);