const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/categoryController');
const requireRole = require('../middleware/requireRole');

router.post('/', requireRole('admin'), CategoryController.create);

module.exports = router;