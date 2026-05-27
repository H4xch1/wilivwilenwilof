const express = require('express');
const {
    getAllUsers,
    getUsersByRole,
    getUserById,
    createUser,
    updateUser,
    deleteUser
} = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');
const router = express.Router();

router.use(verifyToken, roleMiddleware(['admin'])); // semua endpoint user hanya admin

router.get('/', getAllUsers);
router.get('/role/:role', getUsersByRole);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;