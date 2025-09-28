const complaintEvents = require('../events/complaintsEvent');

complaintEvents.on('complaintAssigned', (complaint) => {
  console.log(`[LOG] Complaint ${complaint._id} assigned to ${complaint.assignedTo?.name}`);
});