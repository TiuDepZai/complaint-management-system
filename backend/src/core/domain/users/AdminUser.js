const User = require('./User');

class AdminUser extends User {
  constructor(doc) {
    super(doc);
  }

  isAdmin() { return true; }
  isStaff() { return false; }
  canSeeAll() { return true; }
  canAssign() { return true; }
  canUpdateStatus(/* prev, next, ctx */) { return true; }
}

module.exports = AdminUser;
