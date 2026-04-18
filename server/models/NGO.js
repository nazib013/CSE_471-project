const mongoose = require('mongoose');

const NGOSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ['shelter', 'ngo', 'vet_clinic', 'rescue'],
    required: true,
  },
  description: { type: String, default: '' },
  address: { type: String, required: true },
  city: { type: String, required: true },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  website: { type: String, default: '' },
  // Coordinates for map display
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  // Verification status (admin sets this)
  verified: { type: Boolean, default: false },
  // Services offered
  services: [{ type: String }],
  // Operating hours
  hours: { type: String, default: 'Mon-Fri: 9am - 5pm' },
  // Profile image URL
  image: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('NGO', NGOSchema);
