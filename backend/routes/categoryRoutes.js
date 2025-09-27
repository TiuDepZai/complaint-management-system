const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/categoryController');
const requireRole = require('../middleware/requireRole');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, requireRole('admin'), CategoryController.create);
router.get('/active', protect, CategoryController.listActive);
router.get('/', protect, requireRole('admin'), CategoryController.list);
router.put('/:id', protect, requireRole('admin'), CategoryController.update);
router.delete('/:id', protect, requireRole('admin'), CategoryController.remove);
module.exports = router;