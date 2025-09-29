class MailAdapter {
  async send(_opts) {
    throw new Error('MailAdapter.send() not implemented');
  }
}

module.exports = MailAdapter;