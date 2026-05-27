const mongoose = require('mongoose');

const LaporanKasusSchema = new mongoose.Schema({
    walas_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    siswa_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    judul: { type: String, required: true },
    deskripsi: { type: String, required: true },
    tanggal: { type: Date, default: Date.now },
    status: { type: String, enum: ['belum_dibaca', 'dibaca', 'ditindaklanjuti'], default: 'belum_dibaca' },
}, { timestamps: true });

module.exports = mongoose.model('LaporanKasus', LaporanKasusSchema);