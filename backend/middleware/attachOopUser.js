const UserFactory = require('../src/core/domain/users/UserFactory');

module.exports = function attachOopUser(req, _res, next) {
  // If protect hasn’t set req.user yet, do nothing.
  if (!req.user) return next();

  try {
    // If already an OOP user (has isAdmin function), skip.
    if (typeof req.user?.isAdmin === 'function') return next();

    // Build our polymorphic user from the raw payload/DB doc
    req.user = UserFactory.fromRaw(req.user);
    return next();
  } catch (err) {
    // Don’t break the request pipeline; just fall back to the raw user.
    return next();
  }
};