const mongoose = require('mongoose');

const AbsensiSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tanggal: { type: Date, default: Date.now },
    status: { type: String, enum: ['hadir', 'sakit', 'izin'], required: true },
    file_path: { type: String, default: null },
    foto_kamera: { type: String, default: null },
    keterangan: { type: String, default: '' },
}, { timestamps: true });

AbsensiSchema.index({ user_id: 1, tanggal: 1 }, { unique: true });

module.exports = mongoose.model('Absensi', AbsensiSchema);