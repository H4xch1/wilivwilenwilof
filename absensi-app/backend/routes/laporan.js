const express = require('express');
const { kirimLaporan, riwayatWalas, semuaLaporan, updateStatus } = require('../controllers/laporanController');
const { verifyToken } = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');
const router = express.Router();

router.post('/', verifyToken, roleMiddleware(['walas']), kirimLaporan);
router.get('/riwayat-walas', verifyToken, roleMiddleware(['walas']), riwayatWalas);
router.get('/semua', verifyToken, roleMiddleware(['petugas', 'admin']), semuaLaporan);
router.put('/:id/status', verifyToken, roleMiddleware(['petugas', 'admin']), updateStatus);

module.exports = router;