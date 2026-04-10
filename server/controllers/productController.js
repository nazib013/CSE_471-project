const Product = require('../models/Product');

exports.addProduct = async (req, res) => {
  try {
  const { name, description, amount, category } = req.body;
    const imageUrl = req.file ? req.file.path : null;

    if (!name || !amount || typeof amount !== 'string') {
      return res.status(400).json({ message: 'Name and amount (as text) are required' });
    }

    const product = new Product({
      sellerId: req.user._id,
      name,
      description,
      amount,
      imageUrl,
      category: category || 'General',
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ sellerId: req.user._id });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.q && String(req.query.q).trim()) {
      const q = String(req.query.q).trim();
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ];
    }
    // Hide sold items by default on public listings unless includeSold=true
    if (!('includeSold' in req.query) || String(req.query.includeSold) !== 'true') {
      filter.isSold = { $ne: true };
    }
    const products = await Product.find(filter)
      .populate('sellerId', 'name email')  // Populate seller name & email
      .select('name description amount imageUrl sellerId category isSold'); // include sellerId for frontend

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getCategories = async (_req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories.sort());
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const p = await Product.findById(req.params.id)
      .populate('sellerId', 'name email')
      .select('name description amount imageUrl sellerId category isSold');
    if (!p) return res.status(404).json({ message: 'Not found' });
    res.json(p);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { name, description, amount, category } = req.body;
    const imageUrl = req.file ? req.file.path : null;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Not found' });

    if (name) product.name = name;
    if (description) product.description = description;
    if (amount) product.amount = amount;
    if (category) product.category = category;
    if (imageUrl) product.imageUrl = imageUrl;

    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Not found' });

    await product.remove();
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};