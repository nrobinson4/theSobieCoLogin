const express = require('express');
const router = express.Router();
const mongoClient = require("../services/MongoClientService");
const APIResponse = require("../DTOs/APIResponse");
const { sendEmail } = require("../services/MailerService");

router.use(function(req, res, next) { next() });

router.get('/', async (req, res) => {
    res.render('sobie-form', { pageTitle: 'SOBIE - Register' })
});

router.post('/', async (req, res, next) => {
    try {
        // Extract form data from the request body
        const formData = req.body; // The form data should be sent as JSON in the request body

        // Insert the form data into the 'registrations' collection
        const result = await mongoClient.db("sobie-db").collection("registrations").insertOne(formData);

        // Prepare email content
        const emailSubject = 'Registration Confirmation';
        const emailText = `Hello ${formData.firstName},\n\nThank you for registering. Here are your details:\n\n${JSON.stringify(formData, null, 2)}`;
        const emailHtml = `<p>Hello ${formData.firstName},</p><p>Thank you for registering. Here are your details:</p><pre>${JSON.stringify(formData, null, 2)}</pre>`;

        // Send the email using the sendEmail method from mailer.js
        await sendEmail(formData.email, emailSubject, emailText, emailHtml);

        // Respond with a success message
        const response = new APIResponse();
        response.success('Registration successfully saved!', result);

        // Send the response to the client
        res.status(201).json(response);
    } catch (err) {
        // Handle any errors that occur during the database operation
        console.error(err);
        const response = new APIResponse();
        response.error('Error saving registration data.', err);

        // Send the error response to the client
        res.status(500).json(response);
    }
});

module.exports = router;