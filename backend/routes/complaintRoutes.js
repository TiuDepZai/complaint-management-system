const express = require('express');
const router = express.Router();
const ComplaintController = require('../controllers/complaintController');
<<<<<<< HEAD
=======
const requireRole = require('../middleware/requireRole');
>>>>>>> origin/main
const { protect } = require('../middleware/authMiddleware');

// Only authenticated users can submit a complaint
router.post('/', protect, ComplaintController.create);
router.get('/',  protect, ComplaintController.list);
router.put('/:id', protect, ComplaintController.update);
router.delete('/:id', protect, ComplaintController.remove);
<<<<<<< HEAD
=======
router.put('/:complaintId/assign', protect, requireRole('admin'), ComplaintController.assignComplaint);

>>>>>>> origin/main
module.exports = router;