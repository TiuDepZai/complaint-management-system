const UserModel = require('../models/User');
const AdminEntity = require('../entities/Admin');


// Delete a user (admin-only)
const deleteUser = async (req, res) => {
    try {

        // Find the user to delete
        const user = await UserModel.findById(req.params.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Create Admin entity from logged-in user info
        const admin = new AdminEntity(req.user.name, req.user.email, req.user.permissions);

        // Call entity method for logging/action
        await admin.deleteUser(req.params.userId);

        res.status(204).send(); // No content
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Example: List all users (admin-only)
const listUsers = async (req, res) => {
    try {
        const users = await UserModel.find().select('-password').lean();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { deleteUser, listUsers };
