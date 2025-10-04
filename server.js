const handler = (req, res) => {
  // This file is intentionally not used on Vercel.
  // Static files are served by Vercel and dynamic API routes are under /api/*.
  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Not a runtime entry. Use /api/* endpoints.');
};

module.exports = handler;
