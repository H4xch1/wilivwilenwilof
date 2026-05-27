const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getUsersByRole = async (req, res) => {
    try {
        const users = await User.find({ role: req.params.role }).select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createUser = async (req, res) => {
    try {
        const { nama_lengkap, nik, nis, tanggal_lahir, role, wali_kelas_id, password } = req.body;
        const user = new User({ nama_lengkap, nik, nis, tanggal_lahir, role, wali_kelas_id, password });
        await user.save();
        res.status(201).json({ message: 'User created', user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { nama_lengkap, nik, nis, tanggal_lahir, role, wali_kelas_id, password } = req.body;
        const updateData = { nama_lengkap, nik, nis, tanggal_lahir, role, wali_kelas_id };
        if (password) updateData.password = await bcrypt.hash(password, 10);
        await User.findByIdAndUpdate(req.params.id, updateData);
        res.json({ message: 'User updated' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};