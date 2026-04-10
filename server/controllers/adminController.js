const User = require('../models/User');
const Product = require('../models/Product');
const Complaint = require('../models/Complaint');
const path = require('path');

exports.getAllUsers = async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

  const users = await User.find().select('-password');
  res.json(users);
};

exports.getAllProducts = async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

  try {
    const products = await Product.find()
      .populate('sellerId', 'name email'); // populate sellerId with name and email
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAllComplaints = async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

  const complaints = await Complaint.find().populate('userId', 'name email');
  res.json(complaints);
};

exports.promoteUserToAdmin = async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

  const { userId } = req.params;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: 'User not found' });

  user.role = 'admin';
  await user.save();

  res.json({ message: `User ${user.name} promoted to admin` });
};

exports.deleteUser = async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

  const { userId } = req.params;
  if (req.user._id.toString() === userId) {
    return res.status(400).json({ message: "You can't delete yourself" });
  }

  try {
    await User.findByIdAndDelete(userId);
    await Product.deleteMany({ sellerId: userId }); // optional: delete user's products too
    res.json({ message: 'User and their products deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

  const { productId } = req.params;
  try {
    await Product.findByIdAndDelete(productId);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin: add a new product/pet, optionally for a given sellerId
exports.adminAddProduct = async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  try {
    const { name, description, amount, category, sellerId } = req.body;
    const imageUrl = req.file ? req.file.path : null;
    if (!name || !amount) return res.status(400).json({ message: 'Name and amount are required' });

    const owner = sellerId ? await User.findById(sellerId) : req.user;
    if (!owner) return res.status(400).json({ message: 'Invalid sellerId' });

    const product = new Product({
      sellerId: owner._id,
      name,
      description,
      amount,
      category: category || 'General',
      imageUrl,
    });
    await product.save();
    res.status(201).json(product);
  } catch (e) {
    res.status(500).json({ message: 'Server error', error: e.message });
  }
};
