const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserEntity = require('../entities/User');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Register new user
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const userExists = await UserEntity.existsByEmail(email);
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const userEntity = new UserEntity({ name, email, password });
        const doc = await UserEntity.create(userEntity);

        const userData = doc.toObject();
        delete userData.password;

        res.status(201).json({
            id: doc.id,
            ...userData,
            token: generateToken(doc.id)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Login user
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await UserEntity.findByEmail(email);
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

// Get current profile
const getProfile = async (req, res) => {
    try {
        const user = await UserEntity.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const userData = user.toObject();
        delete userData.password;

        res.status(200).json(userData);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update profile
const updateUserProfile = async (req, res) => {
    try {
        const userDoc = await UserEntity.findById(req.user.id);
        if (!userDoc) return res.status(404).json({ message: 'User not found' });

        const userEntity = new UserEntity(userDoc.toObject());
        userEntity.updateProfile(req.body);

        Object.assign(userDoc, userEntity.toObject());
        await userDoc.save();

        const userData = userDoc.toObject();
        delete userData.password;

        res.json({
            id: userDoc.id,
            ...userData,
            token: generateToken(userDoc.id) // optional: only if you want a refreshed token
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, loginUser, updateUserProfile, getProfile };
