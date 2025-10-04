const { pool, init } = require('./_db');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  await init();

  const q = (req.query && (req.query.q || req.query.query)) || '';
  if (!q) {
    return res.status(400).json({ message: 'Search query is required' });
  }

  try {
    const searchTerm = `%${q}%`;
    const [rows] = await pool.query(
      `SELECT * FROM lost_items WHERE 
        item_name LIKE ? OR 
        color LIKE ? OR 
        location LIKE ? OR 
        description LIKE ? 
        ORDER BY created_at DESC`,
      [searchTerm, searchTerm, searchTerm, searchTerm]
    );
    return res.status(200).json(rows);
  } catch (err) {
    console.error('Error in search-lost-items:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};