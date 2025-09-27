const User = require('./User');

class CustomerUser extends User {
  constructor(doc) {
    super(doc);
  }

  isAdmin() { return false; }
  isStaff() { return false; }
  canSeeAll() { return false; }

  // Customers don’t assign or change status (they can edit their own details elsewhere)
  canAssign() { return false; }
  canUpdateStatus(/* prev, next, ctx */) { return false; }
}

module.exports = CustomerUser;
