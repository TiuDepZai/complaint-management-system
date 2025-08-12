const express = require('express');
const router = express.Router();
const ComplaintController = require('../controllers/complaintController');
const { protect } = require('../middleware/authMiddleware');

// Only authenticated users can submit a complaint
router.post('/', protect, ComplaintController.create);

module.exports = router;