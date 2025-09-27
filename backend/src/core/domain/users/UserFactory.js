const AdminUser    = require('./AdminUser');
const StaffUser    = require('./StaffUser');
const CustomerUser = require('./CustomerUser');

class UserFactory {
  static create(userDoc) {
    if (!userDoc) return null;

    // If a Mongoose doc is passed, convert to plain while keeping _id
    const raw = typeof userDoc.toObject === 'function'
      ? { ...userDoc.toObject(), _id: userDoc._id }
      : userDoc;

    switch (raw.role) {
      case 'admin': return new AdminUser(raw);
      case 'staff': return new StaffUser(raw);
      default:      return new CustomerUser(raw);
    }
  }

  static fromRaw(userDoc) {
    return this.create(userDoc);
  }
}

module.exports = UserFactory;
