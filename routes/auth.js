const express = require('express')
const router = express.Router()
const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

router.get('/register', (req, res) => {
    res.render('register')
})

router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body
        const user = new User({ username, password })
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

router.get('/logout', (req, res) => {
    res.clearCookie('token')
    req.flash('success_msg', 'You have been logged out.')
    res.redirect('/auth/login')
})


module.exports = router