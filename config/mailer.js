const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendResetEmail = async (to, token) => {
    const resetUrl = `${process.env.BASE_URL}/auth/reset-password/${token}`

    const msg = {
        from: process.env.SENDER_EMAIL,
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

    try {
        await sgMail.send(msg)
    } catch(error) {
        if (error.response) {
            console.error(error.response.body)
        }

        throw error
    }
}

module.exports = { sendResetEmail }