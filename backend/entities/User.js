// entities/User.js
class User {
    constructor(name, email, university = '', address = '', role = 'customer') {
        this.name = name;
        this.email = email;
        this.university = university;
        this.address = address;
        this.role = role;
    }

    updateProfile({ name, email, university, address }) {
        this.name = name || this.name;
        this.email = email || this.email;
        this.university = university || this.university;
        this.address = address || this.address;
    }

    toObject() {
        return {
            name: this.name,
            email: this.email,
            university: this.university,
            address: this.address,
            role: this.role
        };
    }
}

module.exports = User;
