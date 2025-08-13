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

module.exports = { create };