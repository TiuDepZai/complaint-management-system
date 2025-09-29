const complaintEvents = require('../events/complaintsEvent');
const NotificationEntity = require('../entities/NotificationEntities');

complaintEvents.on('complaintAssigned', async (evt) => {
  try {
    const complaint = evt?.complaint;
    const staff = complaint?.assignedTo;

    // Only notify on actual assignment (not unassign)
    if (!complaint || !staff || evt?.action === 'unassign') return;

    const notif = new NotificationEntity({
      userId: staff._id,
      type: 'job_assigned',
      message:
        `Hi ${staff.name || ''},\n\n` +
        `You have been assigned a complaint.\n` +
        `Subject: ${complaint.subject}\n` +
        `Reference: ${complaint.reference}\n\n` +
        `Please log in to view details.\n\n` +
        `Regards,\n` +
        `${evt?.actor?.name || 'System Admin'}\n` +
        `*System Admin*`,
      metadata: { complaintId: complaint._id },
    });

    await notif.send(staff);
  } catch (err) {
    console.error('[NotificationObserver] Error handling complaintAssigned:', err);
  }
});
