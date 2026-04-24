const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const { addProduct, getMyProducts, getAllProducts, getCategories, getProductById } = require('../controllers/productController');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'server/uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

const allowAdmin = (req, res, next) => {
  if (req.user?.role === 'admin') return next();
  return res.status(403).json({ message: 'Forbidden' });
};

router.post('/', authMiddleware, upload.single('image'), addProduct);
router.get('/mine', authMiddleware, getMyProducts);
router.get('/all', getAllProducts);
router.get('/categories', getCategories);
router.get('/:id', getProductById);
router.patch('/:id/approve', authMiddleware, allowAdmin, async (req, res) => {
  try {
    const Product = require('../models/Product');

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.isApproved = true;

    await product.save();

    res.json(product);

  } catch (err) {
    console.error("APPROVE PRODUCT ERROR:", err);
    res.status(500).json({ message: 'Failed to approve product' });
  }
});

module.exports = router;
