<<<<<<< HEAD
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
=======
const UserModel = require('../models/User');

class AdminEntity {
  static async deleteUser(userId, actingAdmin) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    console.log(`Admin ${actingAdmin.name} deleted user: ${user.name}`);
    await user.deleteOne();
  }

  static async addStaff({ name, email, password }, actingAdmin) {
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      throw new Error(`User with email ${email} already exists`);
    }

    const staff = new UserModel({
      name,
      email,
      password,
      role: 'staff',
    });

    await staff.save();

    console.log(`Admin ${actingAdmin.name} created new staff: ${staff.name}`);
    return staff;
  }

  static async listUsers() {
    const users = await UserModel.find().select('-password').lean();
    return users;
  }

  static async listStaff() {
    const staff = await UserModel.find({ role: 'staff' }).select('-password').lean();
    return staff;
  }
}

module.exports = AdminEntity;
>>>>>>> origin/main
