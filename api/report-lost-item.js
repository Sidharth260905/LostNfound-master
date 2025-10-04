const { pool, init } = require('./_db');
const nodemailer = require('nodemailer');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  await init();

  try {
    const { itemName, color, location, description } = req.body || {};

    if (!itemName || !color || !location || !description) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    await pool.query(
      'INSERT INTO lost_items (item_name, color, location, description) VALUES (?, ?, ?, ?)',
      [itemName, color, location, description]
    );

    // Optional email notification
    const {
      SMTP_HOST = 'smtp.gmail.com',
      SMTP_PORT = '587',
      SMTP_SECURE = 'false',
      SMTP_USER,
      SMTP_PASS,
      EMAIL_FROM,
      EMAIL_TO,
    } = process.env;

    if (SMTP_USER && SMTP_PASS) {
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: parseInt(SMTP_PORT, 10),
        secure: (SMTP_SECURE || 'false').toLowerCase() === 'true',
        auth: { user: SMTP_USER, pass: SMTP_PASS },
      });

      const from = EMAIL_FROM || SMTP_USER;
      const to = EMAIL_TO || SMTP_USER;

      await transporter.sendMail({
        from,
        to,
        subject: 'Lost Item Reported',
        text: `A lost item has been reported:\nItem Name: ${itemName}\nColor: ${color}\nLocation: ${location}\nDescription: ${description}`,
        html: `<p>A lost item has been reported:</p>
               <ul>
                <li><strong>Item Name:</strong> ${itemName}</li>
                <li><strong>Color:</strong> ${color}</li>
                <li><strong>Location:</strong> ${location}</li>
                <li><strong>Description:</strong> ${description}</li>
               </ul>`,
      });
    }

    return res.status(200).json({
      message: `Lost item reported successfully!${SMTP_USER && SMTP_PASS ? ' Email sent.' : ' (Email notifications not configured)'}`,
    });
  } catch (err) {
    console.error('Error in report-lost-item:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};