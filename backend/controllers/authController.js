// controllers/userController.js
const UserModel = require('../models/User');
const UserEntity = require('../entities/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const userExists = await UserModel.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const doc = await UserModel.create({ name, email, password: password });

        res.status(201).json({
            id: doc.id,
            ...doc.toObject(),
            token: generateToken(doc.id)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await UserModel.findOne({ email: email.trim().toLowerCase() });
        if (user && (await bcrypt.compare(password, user.password))) {
            const userData = user.toObject();
            delete userData.password;
            res.json({
                id: user.id,
                ...userData,
                token: generateToken(user.id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const getProfile = async (req, res) => {
    try {
        const user = await UserModel.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json(user.toObject());
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updateUserProfile = async (req, res) => {
    try {
        const userDoc = await UserModel.findById(req.user.id);
        if (!userDoc) return res.status(404).json({ message: 'User not found' });

        // Load into entity
        const userEntity = new UserEntity(
            userDoc.name,
            userDoc.email,
            userDoc.university,
            userDoc.address,
            userDoc.role
        );

        // Apply updates via entity method
        userEntity.updateProfile(req.body);

        // Apply entity changes back to DB doc
        Object.assign(userDoc, userEntity.toObject());

        await userDoc.save();

        res.json({
            id: userDoc.id,
            ...userDoc.toObject(),
            token: generateToken(userDoc.id)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, loginUser, updateUserProfile, getProfile };
