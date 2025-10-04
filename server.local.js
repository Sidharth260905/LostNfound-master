const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();

// Config from environment variables (with safe defaults for local dev)
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_USER = process.env.DB_USER || "root";
const DB_PASSWORD = process.env.DB_PASSWORD || "";
const DB_DATABASE = process.env.DB_DATABASE || "lost_and_found";

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587", 10);
const SMTP_SECURE = (process.env.SMTP_SECURE || "false").toLowerCase() === "true";
const SMTP_USER = process.env.SMTP_USER; // optional in dev
const SMTP_PASS = process.env.SMTP_PASS; // optional in dev
const EMAIL_FROM = process.env.EMAIL_FROM || (SMTP_USER ? `"Lost N Found" <${SMTP_USER}>` : undefined);
const EMAIL_TO = process.env.EMAIL_TO || ""; // optional fallback; ideally dynamic per user

// Middleware to parse JSON data and enable CORS
app.use(bodyParser.json());
app.use(cors());

// Serve static files (HTML, CSS, JS)
app.use(express.static(__dirname));

let db; // will hold the DB connection after initialization

// Ensure database and tables exist before starting the server
function initDatabaseAndStart() {
  // First, connect without specifying a database to ensure DB exists
  const serverConn = mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    multipleStatements: true,
  });

  serverConn.connect((err) => {
    if (err) {
      console.error("MySQL server connection failed:", err.message);
      console.error("Make sure MySQL is running and credentials are correct.");
      process.exit(1);
    }

    serverConn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_DATABASE}\`` , (err) => {
      if (err) {
        console.error("Failed to create database:", err.message);
        process.exit(1);
      }

      serverConn.end();

      // Now connect to the specific database
      db = mysql.createConnection({
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_DATABASE,
        multipleStatements: true,
      });

      db.connect((err) => {
        if (err) {
          console.error("Database connection failed:", err.message);
          process.exit(1);
        }
        console.log("Connected to MySQL database:", DB_DATABASE);

        // Create tables if they don't exist
        const createTablesSQL = `
          CREATE TABLE IF NOT EXISTS lost_items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            item_name VARCHAR(255) NOT NULL,
            color VARCHAR(100) NOT NULL,
            location VARCHAR(255) NOT NULL,
            description TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
          CREATE TABLE IF NOT EXISTS found_items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            item_name VARCHAR(255) NOT NULL,
            color VARCHAR(100) NOT NULL,
            location VARCHAR(255) NOT NULL,
            description TEXT NOT NULL,
            finder_contact VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `;

        db.query(createTablesSQL, (err) => {
          if (err) {
            console.error("Failed to ensure tables:", err.message);
            process.exit(1);
          }
          console.log("Database is ready.");

          // Start the server after DB is ready
          const PORT = parseInt(process.env.PORT || "3000", 10);
          app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
          });
        });
      });
    });
  });
}

// POST route to save lost item data
app.post("/report-lost-item", (req, res) => {
  const { itemName, color, location, description } = req.body;

  // Basic validation
  if (!itemName || !color || !location || !description) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // SQL query to insert lost item data into the database
  const sql =
    "INSERT INTO lost_items (item_name, color, location, description) VALUES (?, ?, ?, ?)";

  db.query(sql, [itemName, color, location, description], (err) => {
    if (err) {
      console.error("Error inserting data:", err.message);
      return res.status(500).json({ message: "Server error" });
    }

    // Only attempt to send email if SMTP credentials are present
    if (!SMTP_USER || !SMTP_PASS) {
      return res.status(200).json({
        message:
          "Lost item reported successfully! (Email notifications not configured)",
      });
    }

    // Create a transporter object using SMTP transport
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    // Setup email data
    const mailOptions = {
      from: EMAIL_FROM || SMTP_USER,
      to: EMAIL_TO || SMTP_USER,
      subject: "Lost Item Reported",
      text: `A lost item has been reported:\nItem Name: ${itemName}\nColor: ${color}\nLocation: ${location}\nDescription: ${description}`,
      html: `<p>A lost item has been reported:</p>
             <ul>
              <li><strong>Item Name:</strong> ${itemName}</li>
              <li><strong>Color:</strong> ${color}</li>
              <li><strong>Location:</strong> ${location}</li>
              <li><strong>Description:</strong> ${description}</li>
             </ul>`,
    };

    // Send mail with defined transport object
    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.log("Email error:", error.message);
        // Don't fail the request if email fails, just log the error
        res.status(200).json({
          message:
            "Lost item reported successfully! (Note: Email notification failed)",
        });
      } else {
        res
          .status(200)
          .json({ message: "Lost item reported successfully! Email sent." });
      }
    });
  });
});

// POST route to save found item data
app.post("/report-found-item", (req, res) => {
  const { itemName, color, location, description, finderContact } = req.body;

  // Basic validation
  if (!itemName || !color || !location || !description || !finderContact) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // SQL query to insert found item data into the database
  const sql =
    "INSERT INTO found_items (item_name, color, location, description, finder_contact) VALUES (?, ?, ?, ?, ?)";

  db.query(sql, [itemName, color, location, description, finderContact], (err) => {
    if (err) {
      console.error("Error inserting found item data:", err.message);
      return res.status(500).json({ message: "Server error" });
    }
    res.status(200).json({
      message:
        "Found item reported successfully! Thank you for helping reunite lost items with their owners.",
    });
  });
});

// GET route to fetch recent lost items
app.get("/api/recent-lost-items", (req, res) => {
  const sql = "SELECT * FROM lost_items ORDER BY created_at DESC LIMIT 10";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching recent lost items:", err.message);
      return res.status(500).json({ message: "Server error" });
    }
    res.status(200).json(results);
  });
});

// GET route to search lost items
app.get("/api/search-lost-items", (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ message: "Search query is required" });
  }

  const sql = `SELECT * FROM lost_items WHERE 
    item_name LIKE ? OR 
    color LIKE ? OR 
    location LIKE ? OR 
    description LIKE ? 
    ORDER BY created_at DESC`;

  const searchTerm = `%${query}%`;

  db.query(
    sql,
    [searchTerm, searchTerm, searchTerm, searchTerm],
    (err, results) => {
      if (err) {
        console.error("Error searching lost items:", err.message);
        return res.status(500).json({ message: "Server error" });
      }
      res.status(200).json(results);
    }
  );
});

// GET route to fetch recent found items
app.get("/api/recent-found-items", (req, res) => {
  const sql = "SELECT * FROM found_items ORDER BY created_at DESC LIMIT 10";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching recent found items:", err.message);
      return res.status(500).json({ message: "Server error" });
    }
    res.status(200).json(results);
  });
});

// Default route to serve index.html
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Initialize DB and start server
initDatabaseAndStart();
