const complaintEvents = require('../events/complaintsEvent');

complaintEvents.on('complaintAssigned', (complaint) => {
  const id = complaint?._id;
  const assigneeName = complaint?.assignedTo?.name || 'Unknown';
  console.log(`[LOG] Complaint ${id} assigned to ${assigneeName}`);
});