const User = require('../models/User')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
const ErrorResponse = require('../utils/ErrorResponse')
const mailgun = require('mailgun-js')

dotenv.config({ path: './config/config.env' })

const mg = mailgun({ apiKey: process.env.MAILGUN_APIKEY, domain: process.env.DOMAIN });

const getSignedJwtToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    })
}


exports.register = async (req, res, next) => {
    const { email, password } = req.body;

    const activate_token = jwt.sign({ email, password }, process.env.JWT_ACC_ACTIVATE, { expiresIn: '20m' });

    const data = {
        from: 'castromanzano95@gmail.com',
        to: 'felix_1095castro@hotmail.com',
        subject: 'Hello',
        html: `
            <h2>Please click on given link to activate your account</h2>
            <p>${process.env.CLIENT_URL}/authentication/activate/${activate_token}</p>
            `
    };

    mg.messages().send(data, function (error, body) {
        if (error) {
            return res.json({
                message: error.message
            })
        }
        return res.json({ message: 'Email has been sent' })
    })

    // Create User
    //const user = await User.create({
    //    email,
    //    password
    //})

    //const token = getSignedJwtToken(user._id);
    //res.cookie('token', token, {
    //    httpOnly: true
    //});
    //res.status(200).json({ success: true, token })
}

exports.activateAccount = async (req, res, next) => {
    const { token } = req.body;
    if (token) {
        jwt.verify(token, process.env.JWT_ACC_ACTIVATE, exports.function = async (err, decodedtoken) => {
            if (err) {
                return res.status(400).json({ error: "Incorrect link" })
            }
            const { email, password } = decodedtoken;
            const user = await User.create({
                email,
                password
            })

            const id = user.id;
            console.log(id);
            return res.status(200).json({ success: true, data: user, token, id })
            sendTokenResponse(user, 200, res, id);
            
        })
    }
}

exports.login = async (req, res, next) => {

    const { email, password } = req.body;
    console.log(req.body);

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