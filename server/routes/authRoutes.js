const express = require('express');
const router = express.Router();

// 1. ADDED: addInfo to the import
const { register, login, addInfo } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);

// 2. ADDED: The new route to handle profile updates
router.put('/add-info/:id', addInfo);

module.exports = router;