const express = require('express')
const router = express.Router()
const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const { sendResetEmail } = require('../config/mailer')

router.get('/register', (req, res) => {
    res.render('register')
})

router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body

        const existingUser = await User.findOne({ $or: [{ username: username }, { email: email }] })
        if (existingUser) {
            req.flash('error_msg', 'Username or email already in use. Please choose another.')
            return res.redirect('/auth/register')
        }

        const user = new User({ username, email, password })
        await user.save()

        req.flash('success_msg', 'You are now registered and can log in')
        res.redirect('/auth/login')
    } catch(error) {
        req.flash('error_msg', 'Something went wrong. Please try again.')
        res.status(400).send('Error registering user.')
    }
})

router.get('/login', (req, res) => {
    res.render('login')
})

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body
        const user = await User.findOne({ username })

        const isMatch = await bcrypt.compare(password, user.password)

        if (!user || !isMatch) {
            req.flash('error_msg', 'Invalid username or password')
            return res.redirect('/auth/login')
        }

        const token = jwt.sign(
            { _id: user._id.toString() },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        )

        res.cookie('token', token, {
            httpOnly: true
        })

        req.flash('success_msg', 'You are successfully logged in!')
        res.redirect('/products')

    } catch(error) {
        req.flash('error_msg', 'Server error during login.')
        res.redirect('/auth/login')
    }
})

router.get('/forgot-password', (req, res) => {
    res.render('forgot-password')
})

router.post('/forgot-password', async (req, res) => {
    try {
        console.log("Log 1: Received forgot password request..."); 
        const { email } = req.body;
        const user = await User.findOne({ email: email });

        if (!user) {
            console.log("Log 2: User not found for email:", email); 
            req.flash('success_msg', 'If an account with that email exists, a password reset link has been sent.');
            return res.redirect('/auth/forgot-password');
        }

        console.log("Log 3: User found. Generating token..."); 
        const token = crypto.randomBytes(20).toString('hex');
        user.passwordResetToken = token;
        user.passwordResetExpires = Date.now() + 3600000;
        await user.save();

        console.log("Log 4: Token generated. Attempting to send email..."); 
        await sendResetEmail(user.email, token);
        console.log("Log 5: Email function finished. Sending response."); 

        req.flash('success_msg', 'If an account with that email exists, a password reset link has been sent.');
        res.redirect('/auth/forgot-password');

    } catch (error) {
        console.error("!!! Critical Error in forgot-password route:", error);
        req.flash('error_msg', 'Something went wrong.');
        res.redirect('/auth/forgot-password');
    }
});
router.get('/reset-password/:token', async (req, res) => {
    try {
        const token = req.params.token
        const user = await User.findOne({ 
            passwordResetToken: token,
            passwordResetExpires: { $gt: Date.now() }
        })

        if (!user) {
            req.flash('error_msg', 'Password reset token is invalid or has expired.')
            return res.redirect('/auth/forgot-password')
        }

        res.render('reset-password', { token: token })

    } catch(error) {
        req.flash('error_msg', 'Something went wrong')
        res.redirect('/auth/forgot-password')
    }
})

router.post('/reset-password/:token', async (req, res) => {
    try {
        const token = req.params.token
        const user = await User.findOne({ 
            passwordResetToken: token,
            passwordResetExpires: { $gt: Date.now() }
        })

        if (!user) {
            req.flash('error_msg', 'Password reset token is invalid or has expired.')
            return res.redirect('/auth/forgot-password')
        }

        const { password, confirmPassword } = req.body
        if (password !== confirmPassword) {
            req.flash('error_msg', 'Passwords do not match.')
            return res.redirect(`/auth/reset-password/${token}`)
        }

        user.password = password
        user.passwordResetToken = undefined
        user.passwordResetExpires = undefined
        await user.save()

        req.flash('success_msg', 'Password has been updated successfully. Please log in.')
        res.redirect('/auth/login')

    } catch(error) {
        req.flash('error_msg', 'Something went wrong')
        res.redirect('/auth/forgot-password')
    }
})

router.get('/logout', (req, res) => {
    res.clearCookie('token')
    req.flash('success_msg', 'You have been logged out.')
    res.redirect('/auth/login')
})

module.exports = router