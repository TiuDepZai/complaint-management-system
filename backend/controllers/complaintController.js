const mongoose = require('mongoose');
const { complaintAccess } = require('../src/core/proxy'); // <-- use the proxy
const ComplaintEntity = require('../entities/Complaint'); // still needed to build entity in create (if passing entity)
const complaintEvents = require('../events/complaintsEvent');

const isAdmin = (u) => (typeof u?.isAdmin === 'function' ? u.isAdmin() : String(u?.role).toLowerCase() === 'admin');

const create = async (req, res) => {
  try {
    // Keep using ComplaintEntity to build the instance,
    // the proxy delegates to entity.create underneath.
    const userId = req.user._id || req.user.id;
    const entity = new ComplaintEntity({
      ...req.body,
      createdBy: userId,
      name: req.user.name,
      email: req.user.email,
    });

    const complaint = await complaintAccess.create(req.user, entity);
    res.status(201).json(complaint);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const list = async (req, res) => {
  try {
    const complaints = await complaintAccess.list(req.user);
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const update = async (req, res) => {
  try {
    const updated = await complaintAccess.update(req.params.id, req.user, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    await complaintAccess.remove(req.params.id, req.user);
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

    if (!(req.user?.canAssign?.() || isAdmin(req.user))) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const updatedComplaint = await complaintAccess.assignStaff(
      req.user,
      complaintId,
      staffId || null
    );

    res.status(200).json(updatedComplaint);
  } catch (error) {
    const status = error.statusCode || 400;
    res.status(status).json({ message: error.message });
  }
};

module.exports = { create, list, update, remove, assignComplaint };
