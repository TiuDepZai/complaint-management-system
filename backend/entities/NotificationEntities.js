const NotificationFactory = require('../factories/NotificationFactory');
const NotificationModel = require('../models/Notification');

class NotificationEntity {
  constructor({ userId, type, message, metadata, subject }) {
    this.userId = userId;
    this.type = type || 'job_assigned';
    this.message = message;
    this.subject = subject || null; // <-- NEW
    this.metadata = metadata || {};
  }

  async send(user) {
    try {
      // --- Email notification (if user has an email) ---
      if (user && user.email) {
        const emailNotif = NotificationFactory.createNotification('email', {
          to: user.email,
          subject: this.subject || `Notification: ${this.type}`, // <-- use custom subject if present
          message: this.message,
        });
        await emailNotif.send();
      }

      // --- Web notification ---
      const webNotif = NotificationFactory.createNotification('web', {
        userId: this.userId,
        type: this.type,
        message: this.message,
        metadata: this.metadata,
      });
      await webNotif.send();
    } catch (err) {
      console.error('Error sending notification:', err);
      throw err;
    }
  }

  static async list(userId) {
    return NotificationModel.find({ userId }).sort({ createdAt: -1 }).lean();
  }

  static async markAsRead(notificationId, userId) {
    return NotificationModel.findOneAndUpdate(
      { _id: notificationId, userId },
      { $set: { isRead: true } },
      { new: true }
    );
  }

  static async markAllAsRead(userId) {
    return NotificationModel.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true } }
    );
  }
}

module.exports = NotificationEntity;
