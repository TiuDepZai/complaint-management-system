// module.exports = function requireRole(...roles) {
//   return (req, res, next) => {
//     if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
//     if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
//     next();
//   };
// };


function checkRole(user, wanted) {
  const call = (fn) => (typeof user?.[fn] === 'function' ? user[fn]() : false);
  const roleEq = (r) => String(user?.role || '').toLowerCase() === r;

  switch (wanted) {
    case 'admin':
      return call('isAdmin') || roleEq('admin');
    case 'staff':
      return call('isStaff') || roleEq('staff');
    case 'customer':
    case 'user':
      return call('isCustomer') || roleEq('customer') || roleEq('user');
    default:
      return false;
  }
}

module.exports = function requireRole(role) {
  return function (req, res, next) {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if (!checkRole(req.user, role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
};