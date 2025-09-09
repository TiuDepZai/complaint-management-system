const mongoose = require('mongoose');
const ComplaintEntity = require('../entities/Complaint');
const ComplaintModel = require('../models/Complaint');
const Category = require('../models/Category');

const create = async (req, res) => {
  try {
    console.log('Creating complaint with data:', req.body, 'by user:', req.user);

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
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const list = async (req, res) => {
  try {
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

    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const update = async (req, res) => {
  try {
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

    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid complaint id' });

    const existing = await ComplaintModel.findById(id).select('createdBy');
    if (!existing) return res.status(404).json({ message: 'Complaint not found' });

    const isOwner = String(existing.createdBy) === String(req.user.id);
    const isAdmin = req.user.role === 'admin';
    if (!isAdmin && !isOwner) return res.status(403).json({ message: 'Forbidden' });

    await existing.deleteOne();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { create, list, update, remove };
