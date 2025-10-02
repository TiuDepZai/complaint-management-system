class AssignmentContext {
  constructor(strategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy) {
    this.strategy = strategy;
  }

  async assign(complaint, staffId) {
    if (!this.strategy) throw new Error('No assignment strategy set');
    return this.strategy.assign(complaint, staffId);
  }
}

module.exports = AssignmentContext;