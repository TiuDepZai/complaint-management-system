const nodemailer = require('nodemailer');
const MailAdapter = require('./MailAdapter');

class GmailAdapter extends MailAdapter {
  constructor({ user, pass, fromName }) {
    super();
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });
    this.from = fromName ? `"${fromName}" <${user}>` : user;
  }

  async send({ to, subject, text, html }) {
    return this.transporter.sendMail({
      from: this.from,
      to,
      subject,
      text,
      html,
    });
  }
}

module.exports = GmailAdapter;