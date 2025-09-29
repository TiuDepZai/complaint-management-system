const MailAdapter = require('./MailAdapter');

class ConsoleAdapter extends MailAdapter {
  async send({ to, subject, text, html }) {
    console.log('📬 [ConsoleMail]');
    console.log('To:', to);
    console.log('Subject:', subject);
    if (text) console.log('Text:\n', text);
    if (html) console.log('HTML:\n', html);
    return { accepted: [to], rejected: [] };
  }
}

module.exports = ConsoleAdapter;