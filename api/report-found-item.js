const { pool, init } = require('./_db');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  await init();

  try {
    const { itemName, color, location, description, finderContact } = req.body || {};

    if (!itemName || !color || !location || !description || !finderContact) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    await pool.query(
      'INSERT INTO found_items (item_name, color, location, description, finder_contact) VALUES (?, ?, ?, ?, ?)',
      [itemName, color, location, description, finderContact]
    );

    return res.status(200).json({
      message: 'Found item reported successfully! Thank you for helping reunite lost items with their owners.',
    });
  } catch (err) {
    console.error('Error in report-found-item:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};