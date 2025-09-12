const express = require('express');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');
const router = express.Router();

router.get('/users', protect, adminOnly, adminController.listUsers);
router.get('/staff', protect, adminOnly, adminController.listStaff);
router.post('/staff', protect, adminOnly, adminController.addStaff);
router.delete('/users/:userId', protect, adminOnly, adminController.deleteUser);

module.exports = router;