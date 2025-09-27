const User = require('./User');

class StaffUser extends User {
  constructor(doc) {
    super(doc);
  }

  isAdmin() { return false; }
  isStaff() { return true; }
  canSeeAll() { return false; }

  // Staff cannot assign others
  canAssign() { return false; }

  // Staff can move forward only on complaints assigned to them:
  // Assigned -> In Progress -> Resolved
  canUpdateStatus(prev, next, { isAssignee }) {
    if (!isAssignee) return false;
    if (prev === 'Assigned'    && next === 'In Progress') return true;
    if (prev === 'In Progress' && next === 'Resolved')    return true;
    return false;
  }
}

module.exports = StaffUser;
