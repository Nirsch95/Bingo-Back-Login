const jwt = require('jsonwebtoken')
const User = require('../models/User')
const ErrorResponse = require('../utils/ErrorResponse')
const dotenv = require('dotenv')

dotenv.config({ path: './config/config.env' })

let token;
protect = async(req, res, next) => { 
    if(
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ){
        // Set token from Bearer token in header
        token = req.headers.authorization.split(' ')[1];
        
        // Set token from cookies
    } else if(req.cookies.token){
        token = req.cookies.token;
    }

    //Make sure token exists
    if(!token){
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    try{
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        req.user = await User.findById(decoded.id);

        next();
    }catch(err){
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }
}

module.exports = protect;