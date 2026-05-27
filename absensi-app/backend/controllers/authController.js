const User = require('../models/User');
const generateToken = require('../utils/generateToken');

exports.register = async (req, res) => {
    try {
        const { nama_lengkap, nik, nis, tanggal_lahir, role, password } = req.body;
        const existing = await User.findOne({ nik });
        if (existing) return res.status(400).json({ message: 'NIK already exists' });
        const user = new User({ nama_lengkap, nik, nis, tanggal_lahir, role, password });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { nik, password } = req.body;
        const user = await User.findOne({ nik });
        if (!user) return res.status(400).json({ message: 'NIK not found' });
        const isValid = await user.comparePassword(password);
        if (!isValid) return res.status(400).json({ message: 'Invalid password' });
        const token = generateToken(user._id, user.role, user.nama_lengkap);
        res.json({ token, user: { id: user._id, nama: user.nama_lengkap, role: user.role, nik: user.nik } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};