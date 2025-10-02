const AssignStrategy = require('./AssignStrategy');

class ImmediateAssignStrategy extends AssignStrategy {
  async assign(complaint, staffId) {
    complaint.assignedTo = staffId;
    complaint.status = 'Assigned';
    complaint.assignedDate = new Date();
    return complaint;
  }
}

module.exports = ImmediateAssignStrategy;