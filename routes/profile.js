const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const User = require('../models/User')
const bcrypt = require('bcryptjs')

router.get('/profile', auth, (req, res) => {
    res.render('profile')
})

router.post('/profile', auth,  async (req, res) => {
    try {

        const { contactLink } = req.body

        await User.findByIdAndUpdate(req.user._id, { contactLink: contactLink })

        req.flash('success_msg', 'Profile updated successfully!')
        res.redirect('/profile')

    } catch(error) {
        req.flash('error_msg', 'Failed to update profile.')
        res.redirect('/profile')
    }
})

router.get('/profile/change-password', auth, async (req, res) => {
    res.render('change-password')
})

router.post('/profile/change-password', auth, async (req, res) => {
    try {

        const { currentPassword, newPassword, confirmPassword } = req.body 
        const user = req.user

        if (newPassword !== confirmPassword) {
            req.flash('error_msg', 'New passwords do not match.')
            return res.redirect('/profile/change-password')
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password)
        if (!isMatch) {
            req.flash('error_msg', 'Current password is incorrect.')
            return res.redirect('/profile/change-password')
        }

        user.password = newPassword
        await user.save()

        req.flash('success_msg', 'Password updated successfully!')
        res.redirect('/profile')

    } catch(error) {
        console.error(error)
        req.flash('error_msg', 'Server error. Please try again.')
        res.redirect('/profile/change-password')
    }
})

module.exports = router