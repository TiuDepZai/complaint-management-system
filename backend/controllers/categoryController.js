const Category = require('../models/Category');

const list = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 }).lean();
    return res.status(200).json(categories);
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

module.exports = { list, create };
