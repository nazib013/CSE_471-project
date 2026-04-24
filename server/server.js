// Load environment variables
require('dotenv').config();

// Core dependencies
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');

// Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const adminRoutes = require('./routes/adminRoutes');
const orderRoutes = require('./routes/orderRoutes');
const donationRoutes = require('./routes/donationRoutes');
const rssRoutes = require('./routes/rssRoutes');
const requestRoutes = require('./routes/requestRoutes');
const ngoRoutes = require('./routes/ngoRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const tipsRoutes = require('./routes/tipsRoutes');

// Models
const User = require('./models/User');

// Express app setup
const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'Animal Rescue & Adoption Platform API',
    status: 'running',
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/rss', rssRoutes);
app.use('/api/tips', tipsRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/ngos', ngoRoutes);
app.use('/api/payments', paymentRoutes);

// Mask Mongo URI for logs
const maskMongoUri = (uri) => {
  if (!uri) return 'undefined';
  try {
    const u = new URL(uri);
    return `${u.protocol}//***@${u.host}${u.pathname}`;
  } catch {
    return uri;
  }
};

console.log('Mongo URI:', maskMongoUri(process.env.MONGODB_URI));

// Admin auto-create
const createAdminIfNotExists = async () => {
  try {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      console.warn('Admin credentials missing');
      return;
    }

    let user = await User.findOne({ email });
    const hashed = await bcrypt.hash(password, 10);

    if (!user) {
      user = new User({
        name: 'Admin',
        email,
        password: hashed,
        role: 'admin',
      });
      await user.save();
      console.log('Admin created');
    } else {
      user.password = hashed;
      user.role = 'admin';
      await user.save();
      console.log('Admin updated');
    }
  } catch (err) {
    console.error('Admin setup error:', err);
  }
};

// Connect DB
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    await createAdminIfNotExists();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on ${PORT}`);
    });
  } catch (err) {
    console.error('DB connection failed:', err);
    setTimeout(startServer, 5000);
  }
};

startServer();

// Global error handlers
process.on('unhandledRejection', (err) => console.error(err));
process.on('uncaughtException', (err) => console.error(err));