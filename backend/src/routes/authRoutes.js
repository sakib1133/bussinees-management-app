const express = require('express');
const router = express.Router();
const { register, login, getMe, forgotPassword, resetPassword, verifyResetToken } = require('../controllers/authController');
const auth = require('../middlewares/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/verify-reset-token', verifyResetToken);

module.exports = router;
