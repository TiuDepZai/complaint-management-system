
const express = require('express');
const { registerUser, loginUser, updateUserProfile, getProfile } = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { deleteUser, listUsers} = require('../controllers/adminController');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateUserProfile);

router.get('/users', protect, adminOnly, listUsers);
router.delete('/users/:userId', protect, adminOnly, deleteUser);

module.exports = router;
