const GmailAdapter = require('./GmailAdapter');
const ConsoleAdapter = require('./ConsoleAdapter');

function getMailAdapter() {
  const provider = (process.env.EMAIL_PROVIDER || 'console').toLowerCase();

  if (provider === 'gmail') {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;
    const fromName = process.env.EMAIL_FROM_NAME || 'Complaint Hub';
    if (!user || !pass) {
      throw new Error('Missing EMAIL_USER/EMAIL_PASS for Gmail adapter');
    }
    return new GmailAdapter({ user, pass, fromName });
  }

  // default/fallback
  return new ConsoleAdapter();
}

module.exports = { getMailAdapter };