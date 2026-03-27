const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { submitComplaint, getAllComplaints } = require('../controllers/complaintController');

router.post('/', auth, submitComplaint);
router.get('/', auth, getAllComplaints); // Only admin should use this

module.exports = router;
