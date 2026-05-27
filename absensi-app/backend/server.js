const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const connectDB = require('./config/db');
const { verifyToken } = require('./middleware/auth');
const roleMiddleware = require('./middleware/role');
const User = require('./models/User');
const Absensi = require('./models/Absensi');

connectDB();

const app = express();

app.get('/', (req, res) => {
  res.send('API Absensi SMK Citra Negara Is Running... 🟢');
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/absensi', require('./routes/absensi'));
app.use('/api/laporan', require('./routes/laporan'));
app.use('/api/users', require('./routes/user'));

// Statistik untuk admin
app.get('/api/stats', verifyToken, roleMiddleware(['admin']), async (req, res) => {
    const totalSiswa = await User.countDocuments({ role: 'murid' });
    const totalPetugas = await User.countDocuments({ role: 'petugas' });
    const totalWalas = await User.countDocuments({ role: 'walas' });
    const totalAdmin = await User.countDocuments({ role: 'admin' });
    const bulanIni = new Date().toISOString().slice(0, 7);
    const hadir = await Absensi.countDocuments({ status: 'hadir', tanggal: { $regex: bulanIni } });
    const sakit = await Absensi.countDocuments({ status: 'sakit', tanggal: { $regex: bulanIni } });
    const izin = await Absensi.countDocuments({ status: 'izin', tanggal: { $regex: bulanIni } });
    res.json({ totalSiswa, totalPetugas, totalWalas, totalAdmin, chart: [hadir, sakit, izin] });
});

// Siswa bimbingan untuk wali kelas
app.get('/api/walas/siswa-bimbingan', verifyToken, roleMiddleware(['walas']), async (req, res) => {
    const siswa = await User.find({ role: 'murid', wali_kelas_id: req.userId }).select('nama_lengkap nis _id');
    res.json(siswa);
});
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});