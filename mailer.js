const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const app = express();
app.use(bodyParser.json());

// Endpoint to report a lost item
app.post('/report-lost-item', (req, res) => {
    const { itemName, color, location, description } = req.body;

    // Create a transporter object using SMTP transport
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com', 
        port: 587, 
        secure: false, 
        auth: {
            user: 'sidharthgautam8077535532@gmail.com', // Your email address
            pass: 'walsypdcieiaalzr' // Your email password
        }
    });

    // Setup email data
    let mailOptions = {
        from: '"Sender Name" <sidharthgautam8077535532@gmail.com>', 
        to: 'sidharth.2327cseml10@kiet.edu', 
        subject: 'Lost Item Reported',
        text: `A lost item has been reported:
                Item Name: ${itemName}
                Color: ${color}
                Location: ${location}
                Description: ${description}`,
        html: `<p>A lost item has been reported:</p>
               <ul>
                <li><strong>Item Name:</strong> ${itemName}</li>
                <li><strong>Color:</strong> ${color}</li>
                <li><strong>Location:</strong> ${location}</li>
                <li><strong>Description:</strong> ${description}</li>
               </ul>`
    };

    // Send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error occurred: ' + error.message);
            return res.status(500).send('Error sending email: ' + error.message);
        }
        console.log('Message sent: %s', info.messageId);
        res.status(200).send('Email sent successfully: ' + info.messageId);
    });
});

// Start the server
app.listen(3000, () => console.log('Server is running on http://localhost:3000'));