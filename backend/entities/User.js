const UserModel = require('../models/User');

class User {
    constructor({ name, email, university = '', address = '', role = 'customer', password }) {
        if (!name || !name.trim()) throw new Error('Name is required');
        if (!email || !email.trim()) throw new Error('Email is required');

        this.name = name.trim();
        this.email = email.trim().toLowerCase();
        this.university = university;
        this.address = address;
        this.role = role;
        this.password = password; // hashed by schema pre-save
    }

    updateProfile({ name, email, university, address }) {
        if (name !== undefined) this.name = name.trim();
        if (email !== undefined) this.email = email.trim().toLowerCase();
        if (university !== undefined) this.university = university;
        if (address !== undefined) this.address = address;
    }

    toObject() {
        return {
            name: this.name,
            email: this.email,
            university: this.university,
            address: this.address,
            role: this.role,
            password: this.password
        };
    }

    // ---------- DB Operations ----------

    static async create(userEntity) {
        const doc = new UserModel(userEntity.toObject());
        return await doc.save();
    }

    static async findByEmail(email) {
        return await UserModel.findOne({ email: email.trim().toLowerCase() });
    }

    static async findById(id) {
        return await UserModel.findById(id);
    }

    static async existsByEmail(email) {
        return await UserModel.exists({ email: email.trim().toLowerCase() });
    }
}

module.exports = User;
