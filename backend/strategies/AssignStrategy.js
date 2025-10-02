class AssignStrategy {
  async assign(complaint, staffId) {
    throw new Error('assign() must be implemented by concrete strategy');
  }
}

module.exports = AssignStrategy;