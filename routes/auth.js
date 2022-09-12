const express = require('express');
const { register, login, logout, getMe, activateAccount } = require('../controllers/auth');
const auth = express.Router();

auth.post('/register', register);
auth.post('/login', login);
auth.get('/logout', logout);
auth.get('/me', getMe);
auth.post('/email-activate',activateAccount);

module.exports = auth;