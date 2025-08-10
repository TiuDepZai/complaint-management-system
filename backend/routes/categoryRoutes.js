const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/categoryController');
const requireRole = require('../middleware/requireRole');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, requireRole('admin'), CategoryController.create);
router.get('/', protect, requireRole('admin'), CategoryController.list);

module.exports = router;