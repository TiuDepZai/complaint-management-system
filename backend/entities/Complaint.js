const ComplaintModel = require('../models/Complaint');
const CategoryModel = require('../models/Category');
const UserModel = require('../models/User');
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
    
  static async list(user) {
    const isAdmin = user.role === 'admin';
    const isStaff = user.role === 'staff';

    let match = {};

    if (isAdmin) {
      // admin sees all complaints
      match = {};
    } else if (isStaff) {
      // staff sees only complaints assigned to them
      match = { assignedTo: user._id };
    } else {
      // normal users see only complaints they created
      match = { createdBy: user._id };
    }

    return ComplaintModel.find(match)
      .populate({
        path: 'assignedTo',
        select: isAdmin ? 'name email role' : 'name role'
      })
      .populate({
        path: 'category',
        select: 'name status'
      })
      .populate({
        path: 'createdBy',
        select: 'name email'
      })
      .sort({ createdAt: -1 })
      .lean();

  }

  static async update(id, user, data) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid complaint ID');
    }

    const complaint = await ComplaintModel.findById(id);
    if (!complaint) throw new Error('Complaint not found');

    const isOwner = complaint.createdBy?.equals
      ? complaint.createdBy.equals(user._id)
      : String(complaint.createdBy) === String(user._id);

    const isAssignedToUser = complaint.assignedTo?.equals
      ? complaint.assignedTo.equals(user._id)
      : String(complaint.assignedTo || "") === String(user._id);

    const staffAllowed = ['Assigned','In Progress', 'Resolved']; // staff can only move forward
    const allAllowed   = ['Pending', 'Assigned', 'In Progress', 'Resolved'];

    const stampDatesIfNeeded = (prevStatus, nextStatus) => {
      if (!nextStatus || nextStatus === prevStatus) return;
      if (nextStatus === 'In Progress' && !complaint.inProgressDate) {
        complaint.inProgressDate = new Date();
      }
      if (nextStatus === 'Resolved' && !complaint.resolvedDate) {
        complaint.resolvedDate = new Date();
      }
    };

    const prevStatus = complaint.status;

    if (user.role === 'staff') {
      // must be assigned to this staff member
      if (!isAssignedToUser) {
        throw new Error('Not authorized to update this complaint');
      }
      if (data.status === undefined) {
        throw new Error('Only status updates are allowed for staff');
      }
      const next = data.status;

      if (!staffAllowed.includes(next)) {
        throw new Error('Invalid status');
      }

      // enforce forward-only flow for staff
      if (prevStatus === 'Assigned' && next !== 'In Progress') {
        throw new Error('Move to "In Progress" first');
      }
      if (prevStatus === 'In Progress' && next !== 'Resolved') {
        throw new Error('Only allowed to move to "Resolved" from "In Progress"');
      }
      if (prevStatus === 'Resolved') {
        throw new Error('Resolved complaints cannot be updated by staff');
      }

      complaint.status = next;
      stampDatesIfNeeded(prevStatus, next);

    } else {
      // ADMIN or CREATOR (UI already prevents admin from editing status, but keep server rules sane)
      if (user.role !== 'admin' && !isOwner) {
        throw new Error('Not authorized to update this complaint');
      }

      // validate category if provided
      if (data.category !== undefined) {
        if (!mongoose.Types.ObjectId.isValid(data.category)) {
          throw new Error('Invalid category ID');
        }
        const cat = await CategoryModel.findOne({ _id: data.category, status: 'Active' })
          .select('_id')
          .lean();
        if (!cat) throw new Error('Invalid or inactive category');
      }

      const updatableFields = ['subject', 'description', 'category', 'priority', 'status'];
      for (const field of updatableFields) {
        if (data[field] !== undefined) {
          if (field === 'status') {
            if (!allAllowed.includes(data.status)) throw new Error('Invalid status');
            const next = data.status || 'Pending';
            complaint.status = next;
            stampDatesIfNeeded(prevStatus, next);
          } else {
            complaint[field] = data[field];
          }
        }
      }
    }

    await complaint.save();

    // always return fully populated doc so FE row doesn't flicker
    await complaint.populate([
      { path: 'assignedTo', select: 'name email role' },
      { path: 'category',   select: 'name status' },
      { path: 'createdBy',  select: 'name email' },
    ]);

    return complaint;
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


  static async assignStaff(complaintId, staffId) {
    // Read current state once
    const existing = await ComplaintModel.findById(complaintId).select('status');
    if (!existing) throw new Error('Complaint not found');

    const progressed = ['In Progress', 'Resolved'].includes(existing.status);

    if (staffId) {
      // ASSIGN / REASSIGN to a staff member
      const staff = await UserModel.findById(staffId).select('_id role');
      if (!staff || staff.role !== 'staff') {
        throw new Error('Invalid staff user');
      }

      // Block reassign once work has started/finished
      if (progressed) {
        throw new Error('Cannot reassign a complaint that is In Progress or Resolved');
      }

      const updated = await ComplaintModel.findByIdAndUpdate(
        complaintId,
        {
          $set: {
            assignedTo: staff._id,
            assignedDate: new Date(),
            status: 'Assigned',
          },
        },
        { new: true, runValidators: true }
      );

      if (!updated) throw new Error('Complaint not found');
      await updated.populate([
        { path: 'assignedTo', select: 'name email role' },
        { path: 'category',   select: 'name' },
        { path: 'createdBy',  select: 'name email' },
      ]);
      return updated;
    }

    // UNASSIGN (staffId is null/empty) — Option A: block if progressed
    if (progressed) {
      throw new Error('Cannot unassign a complaint that is In Progress or Resolved');
    }

    const updated = await ComplaintModel.findByIdAndUpdate(
      complaintId,
      {
        $set: {
          assignedTo: null,
          assignedDate: null,
          status: 'Pending',
        },
      },
      { new: true, runValidators: true }
    );

    if (!updated) throw new Error('Complaint not found');
    await updated.populate([
      { path: 'assignedTo', select: 'name email role' },
      { path: 'category',   select: 'name' },
      { path: 'createdBy',  select: 'name email' },
    ]);
    return updated;
  }


}

module.exports = ComplaintEntity;
