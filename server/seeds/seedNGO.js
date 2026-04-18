/**
 * Seed script to populate sample NGOs/shelters for Bangladesh.
 * Run with: node server/seeds/seedNGOs.js
 * Make sure MONGODB_URI is in server/.env
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const NGO = require('../models/NGO');

const sampleNGOs = [
  {
    name: 'Obhoyaronno Bangladesh Animal Welfare Foundation',
    type: 'ngo',
    description: 'One of Bangladesh\'s largest animal welfare NGOs, dedicated to rescuing, rehabilitating, and rehoming stray animals across Dhaka.',
    address: 'House 14, Road 4, Dhanmondi',
    city: 'Dhaka',
    phone: '+880 1711-000001',
    email: 'info@obhoyaronno.org',
    website: 'https://obhoyaronno.org',
    latitude: 23.7461,
    longitude: 90.3742,
    verified: true,
    services: ['Rescue', 'Adoption', 'Neutering', 'Vaccination', 'Emergency Care'],
    hours: 'Sat-Thu: 9am - 6pm',
  },
  {
    name: 'Kutta Biral Animal Shelter',
    type: 'shelter',
    description: 'A non-profit shelter in Mirpur providing safe housing for abandoned dogs and cats, with a strong adoption program.',
    address: 'Mirpur Section 10',
    city: 'Dhaka',
    phone: '+880 1812-000002',
    email: 'shelter@kuttabiral.org',
    website: '',
    latitude: 23.8093,
    longitude: 90.3651,
    verified: true,
    services: ['Shelter', 'Adoption', 'Food & Care', 'Veterinary Support'],
    hours: 'Daily: 8am - 7pm',
  },
  {
    name: 'Animal Care & Welfare Society Chittagong',
    type: 'ngo',
    description: 'Providing animal welfare services in Chittagong, including mass neutering drives and free vaccination camps.',
    address: 'GEC Circle, Nasirabad',
    city: 'Chittagong',
    phone: '+880 1911-000003',
    email: 'acws@chittagong.org',
    website: '',
    latitude: 22.3569,
    longitude: 91.7832,
    verified: true,
    services: ['Vaccination', 'Neutering', 'Street Animal Care', 'Rescue'],
    hours: 'Sun-Thu: 10am - 5pm',
  },
  {
    name: 'Gulshan Pet Clinic & Hospital',
    type: 'vet_clinic',
    description: 'A full-service veterinary hospital in Gulshan with experienced vets, surgery facilities, and 24/7 emergency services.',
    address: 'Plot 15, Road 53, Gulshan-2',
    city: 'Dhaka',
    phone: '+880 1755-000004',
    email: 'gulshanpetclinic@gmail.com',
    website: 'https://gulshanpetclinic.com',
    latitude: 23.7943,
    longitude: 90.4144,
    verified: true,
    services: ['Surgery', 'Vaccination', 'Dental Care', 'Emergency', 'Grooming'],
    hours: 'Sat-Thu: 9am - 10pm, Fri: 3pm - 10pm',
  },
  {
    name: 'Dhanmondi Animal Hospital',
    type: 'vet_clinic',
    description: 'Trusted veterinary clinic in Dhanmondi providing routine checkups, vaccinations, and specialized treatment for pets.',
    address: 'Road 27, Dhanmondi',
    city: 'Dhaka',
    phone: '+880 1633-000005',
    email: 'dhanmondivets@gmail.com',
    website: '',
    latitude: 23.7522,
    longitude: 90.3760,
    verified: true,
    services: ['Checkups', 'Vaccination', 'X-ray', 'Lab Tests'],
    hours: 'Daily: 8am - 9pm',
  },
  {
    name: 'Paw Rescue Bangladesh',
    type: 'rescue',
    description: 'Emergency rescue team operating across Dhaka, responding to injured and trapped animals 24/7.',
    address: 'Uttara, Sector 7',
    city: 'Dhaka',
    phone: '+880 1999-000006',
    email: 'rescue@pawrescue.bd',
    website: 'https://pawrescue.bd',
    latitude: 23.8759,
    longitude: 90.3795,
    verified: true,
    services: ['Emergency Rescue', 'First Aid', 'Transport to Vets', 'Fostering'],
    hours: '24 Hours / 7 Days',
  },
  {
    name: 'Rajshahi Animal Welfare Centre',
    type: 'shelter',
    description: 'Shelter and NGO serving the Rajshahi region, providing food, care, and adoption opportunities for abandoned animals.',
    address: 'Shaheb Bazar Road',
    city: 'Rajshahi',
    phone: '+880 1822-000007',
    email: '',
    website: '',
    latitude: 24.3745,
    longitude: 88.6042,
    verified: true,
    services: ['Shelter', 'Adoption', 'Food Support', 'Vaccination'],
    hours: 'Sat-Thu: 9am - 5pm',
  },
  {
    name: 'Sylhet Cat & Dog Rescue',
    type: 'rescue',
    description: 'Volunteer-run rescue and fostering network in Sylhet, specialising in cats and small dogs.',
    address: 'Zindabazar',
    city: 'Sylhet',
    phone: '+880 1744-000008',
    email: 'sylhetrescue@gmail.com',
    website: '',
    latitude: 24.8949,
    longitude: 91.8687,
    verified: true,
    services: ['Rescue', 'Fostering', 'Adoption', 'Spaying & Neutering'],
    hours: 'By appointment',
  },
];

async function seed() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('❌ MONGODB_URI not set in .env');
      process.exit(1);
    }

    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to MongoDB');

    const existing = await NGO.countDocuments();
    if (existing > 0) {
      console.log(`ℹ️  ${existing} NGOs already exist. Skipping seed. Delete them manually to re-seed.`);
      process.exit(0);
    }

    await NGO.insertMany(sampleNGOs);
    console.log(`✅ Seeded ${sampleNGOs.length} sample NGOs.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
