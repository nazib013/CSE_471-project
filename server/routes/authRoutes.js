const express = require('express');
const router = express.Router();

// 1. ADDED updateProfile to the import
const { register, login, addInfo, updateProfile } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.put('/add-info/:id', addInfo);

// 2. ADDED the route for editing basic profile info
router.put('/update-profile/:id', updateProfile);

module.exports = router;