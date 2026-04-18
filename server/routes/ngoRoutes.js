const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
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

// Public routes
router.get('/', getAllNGOs);
router.get('/nearby', getNearbyNGOs);
router.get('/:id', getNGOById);

// Admin-protected routes
router.get('/admin/all', auth, getAllNGOsAdmin);
router.post('/', auth, createNGO);
router.put('/:id', auth, updateNGO);
router.patch('/:id/verify', auth, toggleVerify);
router.delete('/:id', auth, deleteNGO);

module.exports = router;
