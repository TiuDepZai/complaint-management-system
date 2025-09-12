const express = require('express');
const router = express.Router();
const ComplaintController = require('../controllers/complaintController');
const requireRole = require('../middleware/requireRole');
const { protect } = require('../middleware/authMiddleware');

// Only authenticated users can submit a complaint
router.post('/', protect, ComplaintController.create);
router.get('/',  protect, ComplaintController.list);
router.put('/:id', protect, ComplaintController.update);
router.delete('/:id', protect, ComplaintController.remove);
router.put('/:complaintId/assign', protect, requireRole('admin'), ComplaintController.assignComplaint);

module.exports = router;