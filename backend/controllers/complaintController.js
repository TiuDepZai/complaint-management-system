const mongoose = require('mongoose');
const Complaint = require('../models/Complaint');
const Category = require('../models/Category');

const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

const create = async (req, res) => {
  try {
    const { name, email, subject, description, category, priority } = req.body;

    if (!name?.trim() || !email?.trim() || !subject?.trim() || !description?.trim() || !category) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ message: 'Invalid email address' });
    if (!PRIORITIES.includes(priority)) return res.status(400).json({ message: 'Invalid priority' });
    if (!mongoose.Types.ObjectId.isValid(category)) return res.status(400).json({ message: 'Invalid category id' });

    const cat = await Category.findOne({ _id: category, status: 'Active' }).select('_id').lean();
    if (!cat) return res.status(400).json({ message: 'Category not found or inactive' });

    const doc = await Complaint.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      description: description.trim(),
      category,
      priority,
      createdBy: req.user.id, 
    });

    return res.status(201).json(doc);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const list = async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    let match = { createdBy: userId };               // default: only my complaints

    // Optional: admin can see others via ?userId=... or all via ?all=1
    if (role === 'admin') {
      const { userId: qUserId, all } = req.query;
      if (all === '1') {
        match = {};                                   // all complaints
      } else if (qUserId) {
        if (!mongoose.Types.ObjectId.isValid(qUserId)) {
          return res.status(400).json({ message: 'Invalid userId' });
        }
        match = { createdBy: qUserId };
      }
    }

    const complaints = await Complaint.find(match)
      .populate('category', 'name status')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    return res.json(complaints);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, category } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid complaint id' });
    }

    // Fetch to check ownership/exists
    const existing = await Complaint.findById(id).select('createdBy');
    if (!existing) return res.status(404).json({ message: 'Not found' });

    // Only owner or admin can update
    if (req.user.role !== 'admin' && String(existing.createdBy) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const updates = {};

    if (description !== undefined) {
      const trimmed = String(description).trim();
      if (!trimmed) return res.status(400).json({ message: 'Description is required' });
      updates.description = trimmed;
    }

    if (category !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(category)) {
        return res.status(400).json({ message: 'Invalid category id' });
      }
      const cat = await Category.findOne({ _id: category, status: 'Active' }).select('_id').lean();
      if (!cat) return res.status(400).json({ message: 'Category not found or inactive' });
      updates.category = category;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid fields to update (description/category)' });
    }

    const updated = await Complaint.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
      context: 'query',
    })
      .populate('category', 'name status')
      .populate('createdBy', 'name email');

    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
module.exports = { create, list, update };