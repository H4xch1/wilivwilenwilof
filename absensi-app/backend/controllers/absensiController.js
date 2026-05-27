const Absensi = require('../models/Absensi');
const fs = require('fs');

exports.submitAbsensi = async (req, res) => {
    try {
        const { status, keterangan, foto_kamera_base64 } = req.body;
        const userId = req.userId;
        const today = new Date().toISOString().slice(0, 10);
        const existing = await Absensi.findOne({
            user_id: userId,
            tanggal: { $gte: new Date(today), $lt: new Date(today + 'T23:59:59') }
        });
        if (existing) return res.status(400).json({ message: 'Already absen today' });

        let file_path = null;
        if (req.files?.bukti_file) file_path = req.files.bukti_file[0].path;

        let foto_path = null;
        if (foto_kamera_base64 && foto_kamera_base64 !== '') {
            const base64Data = foto_kamera_base64.replace(/^data:image\/\w+;base64,/, "");
            const buffer = Buffer.from(base64Data, 'base64');
            const filename = `kamera_${Date.now()}_${userId}.png`;
            const savePath = `uploads/absensi/kamera/${filename}`;
            fs.writeFileSync(savePath, buffer);
            foto_path = savePath;
        }

        const absensi = new Absensi({
            user_id: userId,
            tanggal: new Date(),
            status,
            file_path,
            foto_kamera: foto_path,
            keterangan
        });
        await absensi.save();
        res.json({ message: 'Absensi recorded', data: absensi });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getRiwayatByUser = async (req, res) => {
    try {
        const absensi = await Absensi.find({ user_id: req.params.userId }).sort({ tanggal: -1 });
        res.json(absensi);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};