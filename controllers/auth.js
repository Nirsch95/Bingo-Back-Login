const User = require('../models/User')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
const ErrorResponse = require('../utils/ErrorResponse')

dotenv.config({ path: './config/config.env' })

const getSignedJwtToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    })
}


exports.register = async (req, res, next) => {
    const { email, password } = req.body;

    // Create User
    const user = await User.create({
        email,
        password
    })

    const token = getSignedJwtToken(user._id);
    res.cookie('token', token, {
        httpOnly: true
    });
    res.status(200).json({ success: true, token })
   
}

exports.login = async (req, res, next) => {

    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
        return next(new ErrorResponse('Please provide an email and password', 400));
    }
    // Check for user

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if password matches

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
        return next(new ErrorResponse('Invalid credentials', 401));
    }

    const token = getSignedJwtToken(user._id);
    res.cookie('token', token, {
        httpOnly: true
    });
    const id = user._id;
    res.status(200).json({ success: true, token, id })
}

exports.logout = async (req, res, next) => {
    res.cookie('token', 'none', {
        httpOnly: true,
    });

    res.status(200).json({
        success: true,
        data: {},
    });
};

exports.getMe = async (req, res, next) => {
    // user is alredy available in req due to the protect middleware
    const user = req.user;
    console.log(user);
    res.status(200).json({
        success: true,
        data: user,
    });
};