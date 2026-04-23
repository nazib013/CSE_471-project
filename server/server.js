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
const requestRoutes = require('./routes/requestRoutes'); // Handled here
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

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Animal Rescue & Adoption Platform API',
    status: 'running',
    version: '1.0.0'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── ROUTES MIDDLEWARE ──────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/rss', rssRoutes);
app.use('/api/tips', tipsRoutes);
app.use('/api/requests', requestRoutes); // Matches frontend /api/requests
app.use('/api/ngos', ngoRoutes);
app.use('/api/payments', paymentRoutes);

// ─── UTILS: SAFE LOGGING & SANITIZATION ─────────────────────────────────
const maskMongoUri = (uri) => {
  if (!uri) return 'undefined';
  try {
    const u = new URL(uri);
    const auth = u.username ? `${u.username}:${u.password ? '***' : ''}@` : '';
    return `${u.protocol}//${auth}${u.host}${u.pathname}`;
  } catch (_) {
    return uri.replace(/:\/\/.*@/, '://***@');
  }
};

const sanitizeMongoUri = (uri) => {
  if (!uri || typeof uri !== 'string') return uri;
  let raw = uri.trim().replace(/^['"]|['"]$/g, '');
  try {
    const u = new URL(raw);
    const clean = (v) => {
      if (v == null) return v;
      let s = String(v).replace(/^<+|>+$/g, '');
      try { s = decodeURIComponent(s); } catch (_) { /* ignore */ }
      return encodeURIComponent(s);
    };
    if (u.username) u.username = clean(u.username);
    if (u.password) u.password = clean(u.password);
    return `${u.protocol}//${u.username}${u.password ? ':' + u.password : ''}@${u.host}${u.pathname}${u.search}${u.hash}`;
  } catch (_) {
    return raw;
  }
};

console.log('ℹ️ MONGODB_URI (masked):', maskMongoUri(sanitizeMongoUri(process.env.MONGODB_URI)));

// ─── ADMIN BOOTSTRAP ────────────────────────────────────────────────────
const createAdminIfNotExists = async () => {
  try {
    const email = process.env.ADMIN_EMAIL;
    const rawPassword = process.env.ADMIN_PASSWORD;

    if (!email || !rawPassword) {
      console.warn('⚠️ ADMIN_EMAIL or ADMIN_PASSWORD missing in .env; skipping admin bootstrap');
      return;
    }

    let user = await User.findOne({ email });
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    if (!user) {
      user = new User({
        name: 'Admin',
        email,
        password: hashedPassword,
        role: 'admin',
      });
      await user.save();
      console.log(`✅ Admin user created: ${email}`);
      return;
    }

    let changed = false;
    if (user.role !== 'admin') {
      user.role = 'admin';
      changed = true;
    }
    user.password = hashedPassword;
    changed = true;

    if (changed) {
      await user.save();
      console.log(`✅ Admin user ensured/updated: ${email}`);
    } else {
      console.log('ℹ️ Admin user already up to date');
    }
  } catch (err) {
    console.error('❌ Failed to ensure admin user:', err);
  }
};

// ─── SERVER STARTUP LOGIC ───────────────────────────────────────────────
let serverStarted = false;
let attempt = 0;
const MAX_DELAY_MS = 30000;

const startHttpServer = () => {
  if (serverStarted) return;
  serverStarted = true;
  const PORT = process.env.PORT || 5001; // Matches your error log port
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

const connectWithRetry = () => {
  const uri = sanitizeMongoUri(process.env.MONGODB_URI);
  if (!uri) {
    console.error('❌ MONGODB_URI is not set.');
    setTimeout(connectWithRetry, 5000);
    return;
  }

  attempt += 1;
  console.log(`🔌 Connecting to MongoDB (attempt ${attempt})...`);
  mongoose
    .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      console.log('✅ Connected to MongoDB');
      createAdminIfNotExists();
      startHttpServer();
    })
    .catch((err) => {
      console.error('❌ MongoDB connection error:', err.message);
      const backoff = Math.min(1000 * Math.pow(2, Math.min(attempt - 1, 5)), MAX_DELAY_MS);
      setTimeout(connectWithRetry, backoff);
    });
};

connectWithRetry();

// Global error handlers
process.on('unhandledRejection', (reason) => console.error('unhandledRejection:', reason));
process.on('uncaughtException', (err) => console.error('uncaughtException:', err));