const mongoose = require('mongoose');
const Category = require('../models/Category');
const Complaint = require('../models/Complaint');
const list = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 }).lean();
    return res.status(200).json(categories);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const listActive = async (req, res) => {
  try {
    const categories = await Category.find({ status: 'Active' })
      .select('_id name')          // only what the dropdown needs
      .sort({ name: 1 })
      .lean();
    return res.json(categories);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const create = async (req, res) => {
  try {
    const { name, description, status } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Name is required' });
    }

    // enforce case-insensitive uniqueness
    const exists = await Category.findOne({ name })
      .collation({ locale: 'en', strength: 2 });
    if (exists) {
      return res.status(409).json({ message: 'Category already exists' });
    }

    const validStatus = ['Active', 'Inactive'];
    const finalStatus = validStatus.includes(status) ? status : 'Active';

    const doc = await Category.create({
      name: name.trim(),
      description,
      status: finalStatus
    });

    return res.status(201).json(doc);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;

    const updates = {};

    // name must be non-empty and unique (case-insensitive)
    if (name !== undefined) {
      const trimmed = name.trim();
      if (!trimmed) return res.status(400).json({ message: 'Name is required' });

      const dupe = await Category.findOne({ name: trimmed })
        .collation({ locale: 'en', strength: 2 });
      if (dupe && String(dupe._id) !== String(id)) {
        return res.status(409).json({ message: 'Category name already exists' });
      }
      updates.name = trimmed;
    }

    // status: optional; if provided, must be valid
    if (status !== undefined) {
      if (!['Active', 'Inactive'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
      updates.status = status;
    }

    // description: optional (allow empty string)
    if (description !== undefined) {
      updates.description = description;
    }

    const updated = await Category.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
      context: 'query',
    });

    if (!updated) return res.status(404).json({ message: 'Not found' });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid category id' });
    }

    // block delete if any complaint uses this category
    const inUse = await Complaint.exists({ category: id });
    if (inUse) {
      return res.status(409).json({ message: 'Category is in use by one or more complaints' });
    }

    const deleted = await Category.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Not found' });

    return res.status(204).send(); // no content
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { list, listActive, create, update, remove };
