const jwt = require('jsonwebtoken');

const generateToken = (id, role, nama) => {
    return jwt.sign({ id, role, nama }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

module.exports = generateToken;