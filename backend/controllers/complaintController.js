<<<<<<< HEAD
const mongoose = require('mongoose');
const ComplaintEntity = require('../entities/Complaint');
const ComplaintModel = require('../models/Complaint');
const Category = require('../models/Category');
=======
const ComplaintEntity = require('../entities/Complaint');
>>>>>>> origin/main

const create = async (req, res) => {
  try {
    console.log('Creating complaint with data:', req.body, 'by user:', req.user);

<<<<<<< HEAD
const complaintEntity = new ComplaintEntity({ 
  ...req.body, 
  createdBy: req.user.id,
  name: req.user.name,
  email: req.user.email
});
    // Validate category exists and is active
    const cat = await Category.findOne({ _id: complaintEntity.category, status: 'Active' }).select('_id').lean();
    if (!cat) return res.status(400).json({ message: 'Category not found or inactive' });

    const doc = await ComplaintModel.create(complaintEntity.toObject());
    res.status(201).json(doc);
=======
    const entity = new ComplaintEntity({ 
      ...req.body, 
      createdBy: req.user.id,
      name: req.user.name,
      email: req.user.email
    });
    
    const complaint = await ComplaintEntity.create(entity);

    res.status(201).json(complaint);
>>>>>>> origin/main
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const list = async (req, res) => {
  try {
<<<<<<< HEAD
    const { id: userId, role } = req.user;
    let match = { createdBy: userId };

    if (role === 'admin') {
      const { userId: qUserId, all } = req.query;
      if (all === '1') {
        match = {};
      } else if (qUserId) {
        if (!mongoose.Types.ObjectId.isValid(qUserId)) {
          return res.status(400).json({ message: 'Invalid userId' });
        }
        match = { createdBy: qUserId };
      }
    }

    const complaints = await ComplaintModel.find(match)
      .populate('category', 'name status')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();

=======
    
    const complaints = await ComplaintEntity.list(req.user);
>>>>>>> origin/main
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const update = async (req, res) => {
  try {
<<<<<<< HEAD
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid complaint id' });

    const existing = await ComplaintModel.findById(id);
    if (!existing) return res.status(404).json({ message: 'Complaint not found' });

    if (req.user.role !== 'admin' && String(existing.createdBy) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const complaintEntity = new ComplaintEntity(existing.toObject());
    const updates = complaintEntity.update(req.body);

    // Validate category if updated
    if (updates.category) {
      const cat = await Category.findOne({ _id: updates.category, status: 'Active' }).select('_id').lean();
      if (!cat) return res.status(400).json({ message: 'Category not found or inactive' });
    }

    const updated = await ComplaintModel.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
      context: 'query'
    })
    .populate('category', 'name status')
    .populate('createdBy', 'name email');

=======
    
    const updated = await ComplaintEntity.update(req.params.id, req.user, req.body);
>>>>>>> origin/main
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const remove = async (req, res) => {
  try {
<<<<<<< HEAD
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid complaint id' });

    const existing = await ComplaintModel.findById(id).select('createdBy');
    if (!existing) return res.status(404).json({ message: 'Complaint not found' });

    const isOwner = String(existing.createdBy) === String(req.user.id);
    const isAdmin = req.user.role === 'admin';
    if (!isAdmin && !isOwner) return res.status(403).json({ message: 'Forbidden' });

    await existing.deleteOne();
    res.status(204).send();
=======
    await ComplaintEntity.remove(req.params.id, req.user);
    res.status(200).json({ message: 'Complaint deleted' });
>>>>>>> origin/main
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

<<<<<<< HEAD
module.exports = { create, list, update, remove };
=======
const assignComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { staffId } = req.body; 

    if (!mongoose.Types.ObjectId.isValid(complaintId)) {
      return res.status(400).json({ message: 'Invalid complaintId' });
    }

    if (staffId && !mongoose.Types.ObjectId.isValid(staffId)) {
      return res.status(400).json({ message: 'Invalid staffId' });
    }

    if (!['admin', 'staff'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const updatedComplaint = await ComplaintEntity.assignStaff(complaintId, staffId || null);
    res.status(200).json(updatedComplaint);

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { create, list, update, remove, assignComplaint };
>>>>>>> origin/main
