const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    }
})

const sendResetEmail = async (to, token) => {
    const resetUrl = `${process.env.BASE_URL}/auth/reset-password/${token}`;
    
    const mailOptions = {
        from: `ProductApp <${process.env.EMAIL_USER}>`, // Recommended to have a name
        to: to,
        subject: 'Password Reset Request',
        html: `
            <p>You requested a password reset.</p>
            <p>Click this <a href="${resetUrl}">link</a> to set a new password.</p>
            <p>This link will expire in one hour.</p>
        `,
    };

    try {
        console.log(`Attempting to send email to: ${to}`);
        let info = await transporter.sendMail(mailOptions);
        
        console.log('Email sent successfully!');
        console.log('Message ID:', info.messageId);
        console.log('Preview URL:', nodemailer.getTestMessageUrl(info)); // Won't work with Gmail but good practice
        
        // ตรวจสอบว่า Gmail ตอบรับอีเมลหรือไม่
        if (info.accepted && info.accepted.includes(to)) {
            console.log('Recipient email was accepted by the server.');
        }
        if (info.rejected && info.rejected.length > 0) {
            console.error('Recipient email was rejected by the server:', info.rejected);
        }

    } catch (error) {
        console.error('!!! Error sending email via Nodemailer:', error);
        // re-throw the error so the calling route's catch block can see it
        throw error; 
    }
};

module.exports = { sendResetEmail };