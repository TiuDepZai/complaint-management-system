const NotificationModel = require('../models/Notification');
const nodemailer = require('nodemailer');
require("dotenv").config();


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
class Notification {
  async send() {
    throw new Error("send() must be implemented by subclass");
  }
}

class EmailNotification extends Notification {
  constructor({ to, subject, message, html }) {
    super();

    this.to = to;
    this.subject = subject;
    this.message = message;
    this.html = html;

    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    this.from = `"My App" <${process.env.EMAIL_USER}>`;
  }

  async send() {
    try {
      return await this.transporter.sendMail({
        from: this.from,
        to: this.to,
        subject: this.subject,
        text: this.message,
        html: this.html,
      });
    } catch (err) {
      console.error("Failed to send email via Gmail:", err.message);
      console.log("Email (Console Fallback):", {
        to: this.to,
        subject: this.subject,
        text: this.message,
        html: this.html,
      });
      return true; 
    }
  }
}

class WebNotification extends Notification {
  constructor({ userId, message, type = 'job_assigned', metadata = {} }) {
    super();
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
