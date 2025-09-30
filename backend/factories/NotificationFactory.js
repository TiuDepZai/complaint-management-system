const NotificationModel = require('../models/Notification');
const { getMailAdapter } = require('../adapters/email');
const nodemailer = require('nodemailer');

class NotificationFactory {
  static createNotification(type, data) {
    switch (type) {
      case 'email':
        return new EmailNotification(data);
      case 'web':
        return new WebNotification(data);
      default:
        throw new Error(`Unknown notification type: ${type}`);
    }
  }
}

// --- Concrete notification classes ---

class EmailNotification {
  constructor({ to, subject, message, html, adapter }) {
    this.to = to;
    this.subject = subject;
    this.message = message;
    this.adapter = adapter || getMailAdapter(); 
  }

  async send() {
    await this.adapter.send({
      to: this.to,
      subject: this.subject,
      text: this.message,
      html: this.html,
    });
  }
}

class WebNotification {
  constructor({ userId, message, type = 'job_assigned', metadata = {} }) {
    this.userId = userId;
    this.message = message;
    this.type = type;
    this.metadata = metadata;
  }

  async send() {
    await NotificationModel.create({
      userId: this.userId,
      message: this.message,
      type: this.type,
      metadata: this.metadata,
      isRead: false,
    });
  }
}

module.exports = NotificationFactory;
