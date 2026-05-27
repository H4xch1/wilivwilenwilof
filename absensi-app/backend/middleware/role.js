const roleMiddleware = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.userRole) return res.status(401).json({ message: 'Unauthorized' });
        if (allowedRoles.includes(req.userRole)) return next();
        return res.status(403).json({ message: 'Forbidden: insufficient role' });
    };
};

module.exports = roleMiddleware;