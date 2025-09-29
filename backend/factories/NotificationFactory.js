const NotificationModel = require('../models/Notification');
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
  constructor({ to, subject, message }) {
    this.to = to;
    this.subject = subject;
    this.message = message;
  }

  async send() {
    const transporter = nodemailer.createTransport({
      service: 'gmail', 
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Complaint Hub" <${process.env.EMAIL_USER}>`,
      to: this.to,
      subject: this.subject,
      text: this.message,
    });

    console.log(`📧 Email sent to ${this.to}`);
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
    console.log(`🔔 Web notification created for user ${this.userId}`);
  }
}

module.exports = NotificationFactory;
