const ComplaintModel = require('../models/Complaint');
const CategoryModel = require('../models/Category');
const mongoose = require('mongoose');

class ComplaintEntity {
  constructor(data) {
    this.name = data.name;
    this.email = data.email;
    this.subject = data.subject;
    this.description = data.description;
    this.category = data.category;
    this.priority = data.priority || 'Medium';
    this.createdBy = data.createdBy;
    this.reference = data.reference; // optional if auto-generated
  }

  /**
   * Convert to plain object (for Mongoose create/update)
   */
  toObject() {
    return {
      name: this.name,
      email: this.email,
      subject: this.subject,
      description: this.description,
      category: this.category,
      priority: this.priority,
      createdBy: this.createdBy,
      reference: this.reference
    };
  }

  // DB Methods

  static async create(entity) {
    const category = await CategoryModel.findById({_id: entity.category, status: 'Active' }).lean();
    if (!category) throw new Error('Invalid or inactive category');

    return ComplaintModel.create(entity.toObject());
  }
    
  static async list(user){
    let match = {createdBy: user._id};
    if(user.role === 'admin'){
      match = {};
    }
    return ComplaintModel.find(match)
    .populate('category', 'name status')
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 })
    .lean();
  }

  static async update(id, user, data){
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid complaint ID');

    const complaint = await ComplaintModel.findById(id);
    if (!complaint) throw new Error('Complaint not found');

    if (user.role !== 'admin' && complaint.createdBy.toString() !== user._id.toString()) {
      throw new Error('Not authorized to update this complaint');
    }

    const updatableFields = ['subject', 'description', 'category', 'priority', 'status'];
    for (const field of updatableFields) {
      if (data[field] !== undefined) complaint[field] = data[field];
    }

    if (data.category) {
      const cat = await CategoryModel.findById({_id: data.category, status: 'Active' }).lean();
      if (!cat) throw new Error('Invalid or inactive category');
    }

    return complain.save()
    .then(doc => doc.populate('category', 'name status')
    .populate('createdBy', 'name email'));
  }

  static async remove(id, user){
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid complaint ID');

    const complaint = await ComplaintModel.findById(id).select('createdBy');
    if (!complaint) throw new Error('Complaint not found');

    const isOwner = complaint.createdBy.toString() === user._id.toString();
    const isAdmin = user.role === 'admin';
    if (!isOwner && !isAdmin) throw new Error('Not authorized to delete this complaint');

    await complaint.deleteOne();
    return true;
  }
}

module.exports = ComplaintEntity;
