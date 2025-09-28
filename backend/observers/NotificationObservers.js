const complaintEvents = require('../events/complaintsEvent');
const NotificationEntity = require('../entities/NotificationEntities');

complaintEvents.on('complaintAssigned', async (complaint) => {
  if (complaint.assignedTo) {
    const notif = new NotificationEntity({
      userId: complaint.assignedTo._id,
      type: 'job_assigned',
      message: `You have been assigned complaint: ${complaint.subject}`,
      metadata: { complaintId: complaint._id },
    });

    await notif.send(complaint.assignedTo);  // e.g., sends email
  }
});
