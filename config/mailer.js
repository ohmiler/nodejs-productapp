const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    }
})

const sendResetEmail = (to, token) => {
    const resetUrl = `${process.env.BASE_URL}/auth/reset-password/${token}`

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: 'Password Reset Request for Your ProductApp Account',
        html: `
            <p>You are receiving this because you have requested the reset of the password for your account.</p>
            <p>Please click on the following link, or paste this into your browser to complete the process:</p>
            <p><a href="${resetUrl}">${resetUrl}</a></p>
            <p>This link will expire in one hour.</p>
            <p>IF you did not request this, please ignore this email and your password will remain unchanged.</p>
        `
    }

    return transporter.sendMail(mailOptions)
}

module.exports = { sendResetEmail }