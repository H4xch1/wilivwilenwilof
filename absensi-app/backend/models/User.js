const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    nama_lengkap: { type: String, required: true },
    nik: { type: String, required: true, unique: true },
    nis: { type: String, default: null },
    tanggal_lahir: { type: Date, required: true },
    role: { type: String, enum: ['admin', 'petugas', 'walas', 'murid'], default: 'murid' },
    wali_kelas_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    password: { type: String, required: true },
}, { timestamps: true });

UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

UserSchema.methods.comparePassword = async function(candidate) {
    return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', UserSchema);