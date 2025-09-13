const CategoryModel = require('../models/Category');
const ComplaintModel = require('../models/Complaint');
const mongoose = require('mongoose');

class CategoryEntity {
    constructor(name, description = '', status = 'Active') {
        if (!name || !name.trim()) throw new Error('Name is required');
        this.name = name.trim();
        this.description = description;
        this.status = ['Active', 'Inactive'].includes(status) ? status : 'Active';
    }

    toObject() {
        return {
            name: this.name,
            description: this.description,
            status: this.status
        };
    }

    // Database Methods
    static async listAll() {
        return CategoryModel.find().sort({ createdAt: -1 }).lean();
    }

    static async listActive() {
        return CategoryModel.find({ status: 'Active' })
        .select('_id name')
        .sort({ name: 1 })
        .lean();
    }

    static async create(categoryEntity) {
        const exists = await CategoryModel.findOne({ name: categoryEntity.name })
        .collation({ locale: 'en', strength: 2 });
        if (exists) throw new Error('Category already exists');
        return CategoryModel.create(categoryEntity.toObject());
    }

    static async update(id, updateData) {
        if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid category ID');

        const category = await CategoryModel.findById(id);
        if (!category) throw new Error('Category not found');

        const entity = new CategoryEntity(category.name, category.description, category.status);
        entity.update(updateData);
        Object.assign(category, entity.toObject());
        return category.save();
    }
    static async remove(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid category ID');
        
        const inUse = await ComplaintModel.exists({ category: id });
        if (inUse) throw new Error('Category is in use and cannot be deleted');

        const deleted = await CategoryModel.findByIdAndDelete(id);
        if (!deleted) throw new Error('Category not found');

        return deleted;
    }
}

module.exports = CategoryEntity;
