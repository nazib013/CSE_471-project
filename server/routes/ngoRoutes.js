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

<<<<<<< HEAD
// ── SPECIFIC ROUTES FIRST ──────────────────────────────────────────────────

// Public: Get all verified NGOs
router.get('/', getAllNGOs);

// Public: Get nearby NGOs
router.get('/nearby', getNearbyNGOs);

// Admin: Get all NGOs including unverified
router.get('/admin/all', auth, getAllNGOsAdmin);

// ── WILDCARD / DYNAMIC ROUTES ──────────────────────────────────────────────

// Public: Get single NGO by ID
router.get('/:id', getNGOById);

// Admin: Create NGO
router.post('/', auth, createNGO);

// Admin: Update NGO
router.put('/:id', auth, updateNGO);

// Admin: Toggle verification
router.patch('/:id/verify', auth, toggleVerify);

// Admin: Delete NGO
=======
// Public routes
router.get('/', getAllNGOs);
router.get('/nearby', getNearbyNGOs);
router.get('/:id', getNGOById);

// Admin-protected routes
router.get('/admin/all', auth, getAllNGOsAdmin);
router.post('/', auth, createNGO);
router.put('/:id', auth, updateNGO);
router.patch('/:id/verify', auth, toggleVerify);
>>>>>>> d915b9ccd4cb6385b3fbc6fee4459447cfb27c06
router.delete('/:id', auth, deleteNGO);

module.exports = router;
