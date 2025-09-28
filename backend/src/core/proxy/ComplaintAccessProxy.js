// A protective proxy that sits in front of ComplaintEntity.
// It delegates to the entity but enforces extra visibility rules and can
// perform capability checks (so controllers can stay thinner).

const mongoose = require('mongoose');

const isAdmin = (u) =>
  (typeof u?.isAdmin === 'function' ? u.isAdmin() : String(u?.role).toLowerCase() === 'admin');

const isStaff = (u) =>
  (typeof u?.isStaff === 'function' ? u.isStaff() : String(u?.role).toLowerCase() === 'staff');

const sameId = (a, b) => String(a || '') === String(b || '');

class ComplaintAccessProxy {
  constructor(complaintEntity) {
    this.target = complaintEntity;
  }

  /**
   * Field masking rules to control what each role sees.
   * Admin: full doc
   * Staff: can see everything needed to work, but hide complainant email
   * Customer: can see own complaints; hide staff email
   */
  sanitizeFor(user, doc) {
    // If doc is a Mongoose doc, make it plain first
    const d = typeof doc?.toObject === 'function' ? doc.toObject() : { ...doc };

    if (isAdmin(user)) {
      return d; // full visibility
    }

    // Staff
    if (isStaff(user)) {
      // Hide complainant email for privacy
      if (d.email) d.email = undefined;
      if (d.createdBy && typeof d.createdBy === 'object') {
        // keep creator's name but drop creator email
        d.createdBy = { _id: d.createdBy._id, name: d.createdBy.name };
      }
      return d;
    }

    // Customer: should only reach here with their own items (entity.list enforces)
    // Hide staff’s email but show name/role
    if (d.assignedTo && typeof d.assignedTo === 'object') {
      d.assignedTo = { _id: d.assignedTo._id, name: d.assignedTo.name, role: d.assignedTo.role };
    }
    // Keep customer’s own email if it’s theirs; otherwise remove
    // (Usually d.email is the reporter's own email; safe to retain)
    return d;
  }

  sanitizeMany(user, docs) {
    return (docs || []).map((doc) => this.sanitizeFor(user, doc));
  }

  // ---- Delegations with access control / masking ---- //

  async create(user, entity) {
    // Anyone authenticated can create (your controller already enforces protect)
    const created = await this.target.create(entity);
    return this.sanitizeFor(user, created);
  }

  async list(user) {
    const list = await this.target.list(user);
    return this.sanitizeMany(user, list);
  }

  async update(id, user, data) {
    const updated = await this.target.update(id, user, data);
    return this.sanitizeFor(user, updated);
  }

  async remove(id, user) {
    // Entity enforces owner/admin; proxy just forwards
    return this.target.remove(id, user);
  }

  async assignStaff(user, complaintId, staffIdOrNull) {
    // Optionally gate here as well (defense-in-depth)
    if (!(user?.canAssign?.() || isAdmin(user))) {
      const err = new Error('Forbidden');
      err.statusCode = 403;
      throw err;
    }

    const updated = await this.target.assignStaff(complaintId, staffIdOrNull);
    return this.sanitizeFor(user, updated);
  }
}

module.exports = ComplaintAccessProxy;