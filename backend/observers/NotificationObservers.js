// observers/NotificationObserver.js
const complaintEvents = require('../events/complaintsEvent');
const NotificationEntity = require('../entities/NotificationEntities');

complaintEvents.on('complaintAssigned', async (complaint) => {
  try {
    const staff = complaint?.assignedTo;
    if (!staff || !staff._id) return;

    const subject = `New complaint assigned: ${complaint.reference || complaint.subject}`;
    const staffName = staff.name || '';
    const message =
      `Hi ${staffName},\n\n` +
      `You have been assigned a complaint.\n` +
      `Subject: ${complaint.subject}\n` +
      `Reference: ${complaint.reference}\n\n` +
      `Please log in to view details.\n\n` +
      `Regards,\n` +
      `System Admin`;

    const notif = new NotificationEntity({
      userId: staff._id,
      type: 'job_assigned',
      subject,           // <-- pass subject to entity
      message,           // <-- pass custom message
      metadata: { complaintId: complaint._id },
    });

    await notif.send(staff);
  } catch (err) {
    console.error('[NotificationObserver] send failed:', err.message);
  }
});
