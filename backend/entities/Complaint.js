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
    this.status = data.status || 'Pending';
    this.assignedTo = data.assignedTo || null;
    this.reference = data.reference; 
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
      status: this.status,    
      assignedTo: this.assignedTo,
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


  static async update(id, user, data) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid complaint ID');
  }

  const complaint = await ComplaintModel.findById(id);
  if (!complaint) throw new Error('Complaint not found');

  if (user.role !== 'admin' && !complaint.createdBy.equals(user._id)) {
    throw new Error('Not authorized to update this complaint');
  }

  const updatableFields = ['subject', 'description', 'category', 'priority', 'status', 'assignedTo'];

  if (data.category !== undefined) {
    if (!mongoose.Types.ObjectId.isValid(data.category)) {
      throw new Error('Invalid category ID');
    }
    const cat = await CategoryModel.findOne({ _id: data.category, status: 'Active' })
      .select('_id')
      .lean();
    if (!cat) throw new Error('Invalid or inactive category');
  }

  for (const field of updatableFields) {
    if (field === 'status') {
      complaint.status = data.status || 'Pending';
    } else if (data[field] !== undefined) {
      complaint[field] = data[field];
    }
  }

  await complaint.save();

  await complaint.populate([
    { path: 'category', select: 'name status' },
    { path: 'createdBy', select: 'name email' },
  ]);

  return complaint;
}


  static async assignStaff(complaintId, staffId) {
    let staff = null;

    if (staffId) {
      staff = await UserModel.findById(staffId);
      if (!staff || staff.role !== 'staff') {
        throw new Error('Invalid staff user');
      }
    }
    const updated = await ComplaintModel.findByIdAndUpdate(
      complaintId,
      { assignedTo: staff ? staffId : null },
      { new: true }
    ).populate('assignedTo', 'name email role');

    if (!updated) throw new Error('Complaint not found');
    return updated;
  
  }
}

module.exports = ComplaintEntity;
