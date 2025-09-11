const User = require('./User');

class Admin extends User {
  constructor(name, email, permissions) {
    super(name, email); // Call parent constructor
    this.permissions = permissions;
  }

  async deleteUser(userId) {
        const user = await UserModel.findById(userId);
        if (!user) {
            throw new Error(`User with ID ${userId} not found`);
        }

        // Optional: log admin action
        console.log(`Admin ${this.name} deleted user: ${user.name}`);

        // Delete from database
        await user.remove();  }
}

module.exports = Admin;