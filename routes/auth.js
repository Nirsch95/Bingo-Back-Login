const express = require('express');
const { register, login, logout, getMe } = require('../controllers/auth');
const auth = express.Router();

auth.post('/register', register);
auth.post('/login', login);
auth.get('/logout', logout);
auth.get('/me', getMe);

module.exports = auth;