const jwt = require('jsonwebtoken')
const User = require('../models/User')

const auth = async (req, res, next) => {
    try {
        const token = req.cookies.token
        if (!token) {
            return res.redirect('/auth/login')
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findOne({ _id: decoded._id })

        if (!user) {
            throw new Error()
        }

        req.user = user
        res.locals.user = user
        next()

    } catch(error) {
        res.redirect('/auth/login')
    }
}

module.exports = auth