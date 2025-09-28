const ComplaintModel = require('../models/Complaint');
const CategoryModel = require('../models/Category');
const UserModel = require('../models/User');
const NotificationEntity = require('./NotificationEntities')
const mongoose = require('mongoose');

// tolerant helpers: work with OOP user or raw { role }
const isAdmin = (u) =>
  (typeof u?.isAdmin === 'function' ? u.isAdmin() : String(u?.role).toLowerCase() === 'admin');

const isStaff = (u) =>
  (typeof u?.isStaff === 'function' ? u.isStaff() : String(u?.role).toLowerCase() === 'staff');

const canSeeAll = (u) =>
  (typeof u?.canSeeAll === 'function' ? u.canSeeAll() : isAdmin(u));

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
      reference: this.reference,
    };
  }

  static async create(entity) {
    const category = await CategoryModel.findById({
      _id: entity.category,
      status: 'Active',
    }).lean();
    if (!category) throw new Error('Invalid or inactive category');
    return ComplaintModel.create(entity.toObject());
  }

  static async list(user) {
    let match = {};
    if (canSeeAll(user)) {
      match = {};
    } else if (isStaff(user)) {
      match = { assignedTo: user._id };
    } else {
      match = { createdBy: user._id };
    }

    return ComplaintModel.find(match)
      .populate({
        path: 'assignedTo',
        select: canSeeAll(user) ? 'name email role' : 'name role',
      })
      .populate({ path: 'category', select: 'name status' })
      .populate({ path: 'createdBy', select: 'name email' })
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
      : String(complaint.assignedTo || '') === String(user._id);

    const allAllowed = ['Pending', 'Assigned', 'In Progress', 'Resolved'];

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

    // --- Staff branch ---
    if (typeof user?.isStaff === 'function' && user.isStaff()) {
      if (!isAssignedToUser) {
        throw new Error('Not authorized to update this complaint');
      }
      if (data.status === undefined) {
        throw new Error('Only status updates are allowed for staff');
      }

      const next = data.status;

      // Explicit transition messages
      if (prevStatus === 'Assigned' && next !== 'In Progress') {
        throw new Error('Move to "In Progress" first');
      }
      if (prevStatus === 'In Progress' && next !== 'Resolved') {
        throw new Error('Only allowed to move to "Resolved" from "In Progress"');
      }
      if (prevStatus === 'Resolved') {
        throw new Error('Resolved complaints cannot be updated by staff');
      }

      // Check polymorphic permission
      const ok = typeof user?.canUpdateStatus === 'function'
        ? user.canUpdateStatus(prevStatus, next, { isOwner, isAssignee: isAssignedToUser })
        : false;

      if (!ok) {
        throw new Error('Not authorized to update this complaint');
      }

      complaint.status = next;
      stampDatesIfNeeded(prevStatus, next);

    } else {
      // --- Admin or Owner branch ---
      const isAdmin = typeof user?.isAdmin === 'function'
        ? user.isAdmin()
        : String(user?.role).toLowerCase() === 'admin';

      if (!isAdmin && !isOwner) {
        throw new Error('Not authorized to update this complaint');
      }

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
    await complaint.populate([
      { path: 'assignedTo', select: 'name email role' },
      { path: 'category', select: 'name status' },
      { path: 'createdBy', select: 'name email' },
    ]);
    return complaint;
  }

  static async remove(id, user) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid complaint ID');

    const complaint = await ComplaintModel.findById(id).select('createdBy');
    if (!complaint) throw new Error('Complaint not found');

    const isOwner = String(complaint.createdBy) === String(user._id);
    if (!isAdmin(user) && !isOwner) throw new Error('Not authorized to delete this complaint');

    await complaint.deleteOne();
    return true;
  }

  static async assignStaff(complaintId, staffId) {
    let update = {
      assignedTo: null,
      assignedDate: null,
      status: 'Pending',
    };

    if (staffId) {
      // validate staff user
      const staff = await UserModel.findById(staffId);
      if (!staff || staff.role !== 'staff') {
        throw new Error('Invalid staff user');
      }

      update = {
        assignedTo: staff._id,
        assignedDate: new Date(),
        status: 'Assigned',
      };
    }

    const updated = await ComplaintModel.findByIdAndUpdate(
      complaintId,
      { $set: update },
      { new: true, runValidators: true }
    ).populate([
      { path: 'assignedTo', select: 'name email role' },  // 👈 ensure email is included
      { path: 'category',   select: 'name' },
      { path: 'createdBy',  select: 'name email' },
    ]);

  if (!updated) throw new Error('Complaint not found');

  if (updated.assignedTo) {
    const notif = new NotificationEntity({
      userId: updated.assignedTo._id,
      type: 'job_assigned',
      message: `You have been assigned complaint: ${updated.subject}`,
      metadata: { complaintId: updated._id },
    });

    await notif.send(updated.assignedTo);  // now has email
  }

    await updated.populate([
      { path: 'assignedTo', select: 'name email role' },
      { path: 'category',   select: 'name' },
      { path: 'createdBy',  select: 'name email' },
    ]);

    return updated;
  }

}

module.exports = ComplaintEntity;
