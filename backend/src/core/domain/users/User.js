// Base domain user: encapsulates shared identity and default capabilities.
class User {
  constructor(doc) {
    this._id = doc._id;
    this.name = doc.name;
    this.email = doc.email;
    this.role = doc.role;
  }

  // Capability booleans (abstraction / polymorphism)
  isAdmin() { return false; }
  isStaff() { return false; }
  canSeeAll() { return false; }       // only Admin overrides to true

  // Domain actions (polymorphism)
  canAssign() { return false; }       // only Admin can assign
  // prev, next, ctx = { isOwner, isAssignee }
  canUpdateStatus(/* prev, next, ctx */) { return false; }
}

module.exports = User;