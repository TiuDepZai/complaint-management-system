const complaintEvents = require('../events/complaintsEvent');

complaintEvents.on('complaintAssigned', (evt) => {
  // evt: { complaint, actor, action }
  const c = evt?.complaint || {};
  const id = c?._id || c?.id || '(unknown)';
  const assigneeName = c?.assignedTo?.name || '(unassigned)';
  const actorName = evt?.actor?.name || '(system)';
  const action = (evt?.action || 'assign').toLowerCase();

  if (action === 'unassign') {
    console.log(`[LOG] ${action.toUpperCase()}: Complaint ${id} unassigned by ${actorName}`);
  } else {
    console.log(`[LOG] ${action.toUpperCase()}: Complaint ${id} assigned to ${assigneeName} by ${actorName}`);
  }
});