class ComplaintEntity {
  constructor(data) {
    this.name = data.name;
    this.email = data.email;
    this.subject = data.subject;
    this.description = data.description;
    this.category = data.category;
    this.priority = data.priority || 'Medium';
    this.createdBy = data.createdBy;
    this.reference = data.reference; // optional if auto-generated
  }

  /**
   * Convert to plain object (for Mongoose create/update)
   */
  toObject() {
    return {
      name: this.name,
      email: this.email,
      subject: this.subject,
      description: this.description,
      category: this.category,
      priority: this.priority,
      createdBy: this.createdBy,
      reference: this.reference
    };
  }

  /**
   * Apply updates and return the updated object
   */
  update(data) {
    const updatableFields = ['name', 'email', 'subject', 'description', 'category', 'priority'];
    for (const field of updatableFields) {
      if (data[field] !== undefined) {
        this[field] = data[field];
      }
    }
    return this.toObject();
  }
}

module.exports = ComplaintEntity;
