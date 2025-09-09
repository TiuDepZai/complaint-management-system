const CategoryEntity = require('../entities/Category');
const CategoryModel = require('../models/Category');
const mongoose = require('mongoose');
const Complaint = require('../models/Complaint');

// List all categories
const list = async (req, res) => {
    try {
        const categories = await CategoryModel.find().sort({ createdAt: -1 }).lean();
        res.status(200).json(categories);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// List active categories only
const listActive = async (req, res) => {
    try {
        const categories = await CategoryModel.find({ status: 'Active' })
            .select('_id name')
            .sort({ name: 1 })
            .lean();
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Create new category
const create = async (req, res) => {
    try {
        const { name, description, status } = req.body;

        const categoryEntity = new CategoryEntity(name, description, status);

        // Case-insensitive uniqueness check
        const exists = await CategoryModel.findOne({ name: categoryEntity.name })
            .collation({ locale: 'en', strength: 2 });
        if (exists) return res.status(409).json({ message: 'Category already exists' });

        const doc = await CategoryModel.create(categoryEntity.toObject());
        res.status(201).json(doc);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update category
const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, status } = req.body;

        const category = await CategoryModel.findById(id);
        if (!category) return res.status(404).json({ message: 'Category not found' });

        const categoryEntity = new CategoryEntity(category.name, category.description, category.status);
        categoryEntity.update({ name, description, status });

        Object.assign(category, categoryEntity.toObject());
        await category.save();

        res.json(category);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete category
const remove = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid category id' });
        }

        const inUse = await Complaint.exists({ category: id });
        if (inUse) return res.status(409).json({ message: 'Category is in use by one or more complaints' });

        const deleted = await CategoryModel.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ message: 'Category not found' });

        res.status(204).send();
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

module.exports = { list, listActive, create, update, remove };
