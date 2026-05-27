const LaporanKasus = require('../models/LaporanKasus');

exports.kirimLaporan = async (req, res) => {
    try {
        const { siswa_id, judul, deskripsi } = req.body;
        const laporan = new LaporanKasus({
            walas_id: req.userId,
            siswa_id,
            judul,
            deskripsi,
            tanggal: new Date()
        });
        await laporan.save();
        res.json({ message: 'Laporan terkirim' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.riwayatWalas = async (req, res) => {
    try {
        const laporan = await LaporanKasus.find({ walas_id: req.userId })
            .populate('siswa_id', 'nama_lengkap nis')
            .sort({ tanggal: -1 });
        res.json(laporan);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.semuaLaporan = async (req, res) => {
    try {
        const laporan = await LaporanKasus.find({})
            .populate('walas_id', 'nama_lengkap nik')
            .populate('siswa_id', 'nama_lengkap nis')
            .sort({ tanggal: -1 });
        res.json(laporan);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        await LaporanKasus.findByIdAndUpdate(req.params.id, { status });
        res.json({ message: 'Status updated' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};