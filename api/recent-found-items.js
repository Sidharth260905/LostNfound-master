const { pool, init } = require('./_db');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  await init();

  try {
    const [rows] = await pool.query(
      'SELECT * FROM found_items ORDER BY created_at DESC LIMIT 10'
    );
    return res.status(200).json(rows);
  } catch (err) {
    console.error('Error in recent-found-items:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};