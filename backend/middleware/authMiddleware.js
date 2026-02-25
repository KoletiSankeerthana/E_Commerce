const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');


// Protect routes (user must be logged in)
const protect = asyncHandler(async (req, res, next) => {

    let token;

    // Check Authorization header
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {

        try {

            // Extract token
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Attach user to request
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                res.status(401);
                throw new Error('User not found');
            }

            next();

        } catch (error) {

            console.error('JWT Error:', error.message);

            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    }

    // If no token
    if (!token) {

        res.status(401);
        throw new Error('Not authorized, no token');
    }
});


// Admin middleware
const admin = (req, res, next) => {

    if (req.user && req.user.isAdmin === true) {

        next();

    } else {

        res.status(403);
        throw new Error('Not authorized as admin');
    }
};


module.exports = {
    protect,
    admin
};
