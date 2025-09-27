const ComplaintEntity = require('../entities/Complaint');
const mongoose = require('mongoose');

const isAdmin = (u) => (typeof u?.isAdmin === 'function' ? u.isAdmin() : String(u?.role).toLowerCase() === 'admin');

const create = async (req, res) => {
  try {
    const entity = new ComplaintEntity({
      ...req.body,
      createdBy: req.user.id,
      name: req.user.name,
      email: req.user.email,
    });
    const complaint = await ComplaintEntity.create(entity);
    res.status(201).json(complaint);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const list = async (req, res) => {
  try {
    const complaints = await ComplaintEntity.list(req.user);
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const update = async (req, res) => {
  try {
    const updated = await ComplaintEntity.update(req.params.id, req.user, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    await ComplaintEntity.remove(req.params.id, req.user);
    res.status(200).json({ message: 'Complaint deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const assignComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { staffId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(complaintId)) {
      return res.status(400).json({ message: 'Invalid complaintId' });
    }
    if (staffId && !mongoose.Types.ObjectId.isValid(staffId)) {
      return res.status(400).json({ message: 'Invalid staffId' });
    }

    // polymorphic guard
    if (!req.user?.canAssign?.() && !isAdmin(req.user)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const updatedComplaint = await ComplaintEntity.assignStaff(complaintId, staffId || null);
    res.status(200).json(updatedComplaint);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { create, list, update, remove, assignComplaint };
