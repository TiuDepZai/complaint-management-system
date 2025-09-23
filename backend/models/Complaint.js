const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true, match: [/^\S+@\S+\.\S+$/, 'Invalid email address'] },
  subject: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, required: true, trim: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
  priority: { type: String, required: true, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
  status: {  type: String,  enum: ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Closed'],  default: 'Pending',  index: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  assignedDate: { type: Date, default: null },
  reference: { type: String, unique: true, index: true },                 // complaint ref no.
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }, // owner
}, { timestamps: true });

// Auto-generate reference if missing (e.g. CMP-123456-AB12CD)
complaintSchema.pre('validate', function(next) {
  if (!this.reference) {
    const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
    const tail = Date.now().toString().slice(-6);
    this.reference = `CMP-${tail}-${rand}`;
  }
  next();
});

module.exports = mongoose.model('Complaint', complaintSchema);
