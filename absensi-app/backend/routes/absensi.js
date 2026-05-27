const express = require('express');
const { submitAbsensi, getRiwayatByUser } = require('../controllers/absensiController');
const { verifyToken } = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');
const upload = require('../middleware/upload');
const router = express.Router();

router.post('/',
    verifyToken,
    roleMiddleware(['murid']),
    upload.fields([{ name: 'bukti_file' }, { name: 'foto_kamera' }]),
    submitAbsensi
);

router.get('/riwayat/:userId', verifyToken, getRiwayatByUser);

module.exports = router;