const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const auth = authMiddleware.protect || authMiddleware;

const {
  getAllNGOs,
  getNGOById,
  getNearbyNGOs,
  createNGO,
  updateNGO,
  toggleVerify,
  deleteNGO,
  getAllNGOsAdmin,
} = require('../controllers/ngoController');

// Specific routes first
router.get('/nearby', getNearbyNGOs);
router.get('/admin/all', auth, getAllNGOsAdmin);

// Public routes
router.get('/', getAllNGOs);
router.get('/:id', getNGOById);

// Admin routes
router.post('/', auth, createNGO);
router.put('/:id', auth, updateNGO);
router.patch('/:id/verify', auth, toggleVerify);
router.delete('/:id', auth, deleteNGO);

module.exports = router;