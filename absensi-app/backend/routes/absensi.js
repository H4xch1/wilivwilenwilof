import express from 'express';
import multer from 'multer';
import path from 'path';
import { verifyToken, checkRole } from '../middleware/auth.js';
import Absensi from '../models/Absensi.js';
import User from '../models/User.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/absensi/'),
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${req.user.userId}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/', verifyToken, checkRole('murid'), upload.single('bukti_file'), async (req, res) => {
  try {
    const { status, keterangan, foto_kamera } = req.body;
    const tanggal = new Date().toISOString().split('T')[0];
    const userId = req.user.userId;

    const existing = await Absensi.findOne({ user_id: userId, tanggal });
    if (existing) return res.status(400).json({ message: 'Anda sudah absen hari ini!' });

    let fotoPath = null;
    if (foto_kamera) {
      const base64Data = foto_kamera.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      fotoPath = `uploads/absensi/kamera/kamera_${Date.now()}_${userId}.png`;
    }

    const absensi = new Absensi({
      user_id: userId, tanggal, status,
      file_path: req.file ? req.file.path : null,
      foto_kamera: fotoPath,
      keterangan: keterangan || ''
    });

    await absensi.save();
    res.status(201).json({ message: `Absensi berhasil dicatat sebagai ${status}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/riwayat', verifyToken, checkRole('murid'), async (req, res) => {
  try {
    const riwayat = await Absensi.find({ user_id: req.user.userId }).sort({ tanggal: -1 });
    res.json(riwayat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/walas/:siswaId', verifyToken, checkRole('walas'), async (req, res) => {
  try {
    const siswa = await User.findOne({ _id: req.params.siswaId, wali_kelas_id: req.user.userId });
    if (!siswa) return res.status(403).json({ message: 'Bukan siswa bimbingan Anda' });

    const absensi = await Absensi.find({ user_id: req.params.siswaId }).sort({ tanggal: -1 }).limit(30);
    res.json(absensi);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/statistik/bulan-ini', verifyToken, checkRole('admin'), async (req, res) => {
  try {
    const bulanIni = new Date().toISOString().slice(0, 7);
    const hadir = await Absensi.countDocuments({ status: 'hadir', tanggal: { $regex: `^${bulanIni}` } });
    const sakit = await Absensi.countDocuments({ status: 'sakit', tanggal: { $regex: `^${bulanIni}` } });
    const izin = await Absensi.countDocuments({ status: 'izin', tanggal: { $regex: `^${bulanIni}` } });
    res.json({ labels: ['Hadir', 'Sakit', 'Izin'], data: [hadir, sakit, izin] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;