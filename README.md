# Lost N Found (Full Stack) — Setup Guide

This project is a simple full-stack Lost & Found app for college students. It includes:
- Static frontend (HTML/CSS/JS) served by Express
- Node.js/Express backend
- MySQL database (auto-created on first run)
- Optional email notifications (SMTP)

Prerequisites
- Node.js 18+
- MySQL Server (or XAMPP/WAMP)

Quick start (Windows PowerShell)
1) Install dependencies
   npm --prefix "C:\Users\Sidharth gautam\OneDrive\Desktop\LostNfound-master" install express mysql2 body-parser cors nodemailer dotenv

2) Create environment file
   - Copy .env.example to .env and fill values.
   - Minimum for local dev:
       DB_HOST=localhost
       DB_USER=root
       DB_PASSWORD=
       DB_DATABASE=lost_and_found
   - Optional (for email notifications): set SMTP_* and EMAIL_* values.

3) Run the app
   npm --prefix "C:\Users\Sidharth gautam\OneDrive\Desktop\LostNfound-master" start
   - Open http://localhost:3000 in your browser.
   - The server will automatically create the database and tables if they do not exist.

Project structure
- server.js           Express server and API routes
- index.html          Home page
- lost.html           Report a lost item (POST /report-lost-item)
- found_form.html     Report a found item (POST /report-found-item)
- found.html          Search and recent lost items (GET /api/...)
- styles.css          Styles
- scripts.js          Placeholder for homepage scripts
- schema.sql          SQL reference for DB schema (optional manual setup)
- .env.example        Example environment variables

Database schema (created automatically)
- lost_items(id, item_name, color, location, description, created_at)
- found_items(id, item_name, color, location, description, finder_contact, created_at)

API endpoints
- POST /report-lost-item
  Body: { itemName, color, location, description }
  Effect: Inserts into lost_items, optionally sends email notification.

- POST /report-found-item
  Body: { itemName, color, location, description, finderContact }
  Effect: Inserts into found_items.

- GET /api/recent-lost-items
  Returns the 10 most recent lost items.

- GET /api/search-lost-items?q=term
  Searches lost_items by item_name, color, location, and description.

- GET /api/recent-found-items
  Returns the 10 most recent found items.

Email notifications (optional)
- Set SMTP_USER and SMTP_PASS (e.g., Gmail App Password) and related SMTP_* variables in .env.
- If SMTP is not configured, the app will still work and simply skip email sending.

Troubleshooting
- MySQL connection failed: Ensure MySQL is running and DB credentials in .env are correct.
- Port is in use: Change PORT in .env.
- CORS issues: Frontend is served by the same Express server; ensure you visit via http://localhost:3000.

Development tips
- You can install nodemon for auto-reload during development:
  npm --prefix "C:\Users\Sidharth gautam\OneDrive\Desktop\LostNfound-master" install --save-dev nodemon
  Then add a dev script and run via npm run dev.
