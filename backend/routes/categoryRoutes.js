const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/categoryController');
const requireRole = require('../middleware/requireRole');

router.post('/', CategoryController.create);

module.exports = router;