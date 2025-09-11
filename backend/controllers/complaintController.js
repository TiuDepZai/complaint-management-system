const ComplaintEntity = require('../entities/Complaint');

const create = async (req, res) => {
  try {
    console.log('Creating complaint with data:', req.body, 'by user:', req.user);

    const entity = new ComplaintEntity({ 
      ...req.body, 
      createdBy: req.user.id,
      name: req.user.name,
      email: req.user.email
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

module.exports = { create, list, update, remove };
