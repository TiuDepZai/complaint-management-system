const AdminEntity = require('../entities/Admin');

const addStaff = async (req, res) => {
  try {
    const staff = await AdminEntity.addStaff(
      {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
      },
      { name: req.user.name, email: req.user.email } 
    );

    res.status(201).json({
      message: 'Staff created successfully',
      staff: {
        id: staff._id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
      },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const listUsers = async (req, res) => {
  try {
    const users = await AdminEntity.listUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const listStaff = async (req, res) => {
  try {
    const staff = await AdminEntity.listStaff();
    res.status(200).json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const admin = new AdminEntity(req.user.name, req.user.email, req.user.permissions);
    await admin.deleteUser(req.params.userId);

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { deleteUser, addStaff, listUsers, listStaff };
