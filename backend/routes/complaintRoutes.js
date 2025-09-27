const express = require('express');
const router = express.Router();
const ComplaintController = require('../controllers/complaintController');
const requireRole = require('../middleware/requireRole');
const { protect } = require('../middleware/authMiddleware');
const attachOopUser = require('../middleware/attachOopUser');

// Only authenticated users can submit a complaint
router.post('/', protect, attachOopUser, ComplaintController.create);
router.get('/', protect, attachOopUser, ComplaintController.list);
router.put('/:id', protect, attachOopUser, ComplaintController.update);
router.delete('/:id', protect, attachOopUser, ComplaintController.remove);

// Only admin can assign
router.put('/:complaintId/assign',
  protect,
  attachOopUser,
  requireRole('admin'),
  ComplaintController.assignComplaint
);

module.exports = router;