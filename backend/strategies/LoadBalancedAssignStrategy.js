const AssignStrategy = require('./AssignStrategy');
const ComplaintModel = require('../models/Complaint');

class LoadBalancedAssignStrategy extends AssignStrategy {
  constructor(maxLoad = 5) {
    super();
    this.maxLoad = maxLoad;
  }

  async assign(complaint, staffId) {
    const activeCount = await ComplaintModel.countDocuments({
      assignedTo: staffId,
      status: { $in: ['Assigned', 'In Progress'] },
    });

    if (activeCount >= this.maxLoad) {
      throw new Error('Staff overloaded with active complaints');
    }

    complaint.assignedTo = staffId;
    complaint.status = 'Assigned';
    complaint.assignedDate = new Date();
    return complaint;
  }
}

module.exports = LoadBalancedAssignStrategy;