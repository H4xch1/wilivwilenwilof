import express from 'express';
import { verifyToken, checkRole } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

router.get('/:role', verifyToken, checkRole('admin'), async (req, res) => {
  try {
    const users = await User.find({ role: req.params.role }).populate('wali_kelas_id', 'nama_lengkap');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/profile/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate('wali_kelas_id', 'nama_lengkap');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', verifyToken, checkRole('admin'), async (req, res) => {
  try {
    const { nama, nik, nis, tanggal_lahir, role, wali_kelas_id, password } = req.body;
    const updateData = { nama_lengkap: nama, nik, nis, tanggal_lahir, role, wali_kelas_id };

    if (password) {
      const bcrypt = await import('bcryptjs');
      updateData.password = await bcrypt.hash(password, 10);
    }

    await User.findByIdAndUpdate(req.params.id, updateData);
    res.json({ message: 'Data berhasil diupdate' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', verifyToken, checkRole('admin'), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/list/walas', verifyToken, async (req, res) => {
  try {
    const walas = await User.find({ role: 'walas' }, 'nama_lengkap');
    res.json(walas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;