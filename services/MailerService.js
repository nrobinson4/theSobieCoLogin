require('dotenv').config();
const nodemailer = require('nodemailer');

// Create a reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    host: 'smtp.oxcs.bluehost.com', // SMTP server for Bluehost
    port: 587, // Port for sending emails securely (SSL)
    secure: false,
    auth: {
        user: process.env.SMTP_USERNAME, // Email address from environment variable
        pass: process.env.SMTP_PASSWORD  // Email password from environment variable
    }
});

/**
 * Send an email using SMTP with Nodemailer
 * @param {string} to - Recipient's email address
 * @param {string} subject - Email subject
 * @param {string} text - Email body text (plain text)
 * @param {string} html - Email body (HTML format)
 * @returns {Promise} - Resolves with the result of the email send operation
 */
const sendEmail = async (to, subject, text, html) => {
    const mailOptions = {
        from: process.env.SMTP_USERNAME, // Sender's email (same as auth user)
        to, // Recipient's email
        subject, // Email subject
        text, // Plain text body
        html, // HTML body (optional)
    };

    try {
        // Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email');
    }
};

module.exports = { sendEmail };
