// const express = require("express");
// const cors = require("cors");
// const bodyParser = require("body-parser");
// const { Pool } = require("pg");

// const app = express();
// app.use(express.json());
// app.use(cors());
// app.use(bodyParser.json());

// const pool = new Pool({
//   user: "postgres",
//   host: "localhost",
//   database: "adeshtest",
//   password: "adesh",
//   port: 5432,
// });

// // Helper to create safe table names
// function getTableName(name) {
//   return "invoice_" + name.toLowerCase().replace(/[^a-z0-9]/g, "_");
// }

// // Initialize tenants table
// async function initDB() {
//   await pool.query(`
//     CREATE TABLE IF NOT EXISTS tenants (
//       id SERIAL PRIMARY KEY,
//       name TEXT UNIQUE NOT NULL,
//       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//     );
//   `);
//   console.log("✅ tenants table ready");
// }
// initDB();

// // Save invoice
// app.post("/api/invoice", async (req, res) => {
//   const client = await pool.connect();
//   try {
//     const {
//       clientName,
//       mobile,
//       invoiceNo,
//       invoiceDate,
//       items,
//       subTotal,
//       roundOff,
//       grandTotal,
//     } = req.body;

//     const tableName = getTableName(clientName);

//     await client.query("BEGIN");

//     // Save client if new
//     await client.query(
//       `INSERT INTO tenants(name) VALUES($1)
//        ON CONFLICT (name) DO NOTHING`,
//       [clientName]
//     );

//     // Create table for client invoices if not exists
//   await client.query(`
//   CREATE TABLE IF NOT EXISTS ${tableName} (
//     id SERIAL PRIMARY KEY,
//     mobile TEXT,
//     invoice_no TEXT,
//     invoice_date TEXT,
//     items JSONB,
//     sub_total NUMERIC,
//     round_off NUMERIC,
//     grand_total NUMERIC,
//     paid_amount NUMERIC DEFAULT 0,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//   );
// `);


//     // Insert invoice
//     await client.query(
//       `INSERT INTO ${tableName}
//       (mobile, invoice_no, invoice_date, items, sub_total, round_off, grand_total)
//       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
//       [
//         mobile,
//         invoiceNo,
//         invoiceDate,
//         JSON.stringify(items),
//         subTotal,
//         roundOff,
//         grandTotal,
//       ]
//     );

//     await client.query("COMMIT");
//     res.json({ message: "Invoice saved successfully" });

//   } catch (err) {
//     await client.query("ROLLBACK");
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   } finally {
//     client.release();
//   }
// });

// // Get all tenants
// app.get("/api/tenants", async (req, res) => {
//   try {
//     const result = await pool.query("SELECT name FROM tenants ORDER BY name");
//     res.json(result.rows);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Search invoices
// app.get("/api/search", async (req, res) => {
//   const { q } = req.query; // search string
//   try {
//     const tenantsRes = await pool.query("SELECT name FROM tenants");
//     const tenants = tenantsRes.rows;

//     let allResults = [];

//     for (let t of tenants) {
//       const tableName = getTableName(t.name);

//       const tableCheck = await pool.query(
//         `SELECT to_regclass($1) as exists`,
//         [tableName]
//       );
//       if (!tableCheck.rows[0].exists) continue;

//    let query = `SELECT id, '${t.name}' AS client_name, mobile, invoice_no, invoice_date, 
//              sub_total, round_off, grand_total, paid_amount,
//              (grand_total - COALESCE(paid_amount,0)) AS pending_amount
//              FROM ${tableName}`;

// if (q) {
//   query += ` WHERE '${t.name}' ILIKE $1 OR invoice_no ILIKE $1`;
//   values = [`%${q}%`];
// }


//       const result = await pool.query(query, values);
//       allResults = allResults.concat(result.rows);
//     }

//     res.json(allResults);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // Get all tenants
// app.get("/api/tenants", async (req, res) => {
//   try {
//     const result = await pool.query("SELECT name FROM tenants ORDER BY name");
//     res.json(result.rows); // returns [{name: 'Client1'}, {name: 'Client2'}, ...]
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });
// // Record a payment for an invoice
// app.post("/api/payment", async (req, res) => {
//   const { clientName, invoiceId, amountPaid } = req.body;
//   const client = await pool.connect();

//   try {
//     const tableName = getTableName(clientName);

//     // Update paid amount
//     await client.query(
//       `UPDATE ${tableName} 
//        SET paid_amount = COALESCE(paid_amount,0) + $1
//        WHERE id = $2`,
//       [amountPaid, invoiceId]
//     );

//     res.json({ message: "Payment recorded successfully" });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   } finally {
//     client.release();
//   }
// });


// app.listen(5000, () =>
//   console.log("🚀 Server running on http://localhost:5000")
// );











// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const bodyParser = require("body-parser");
// const { Pool } = require("pg");
// const path = require("path");
// const app = express();
// app.use(express.json());
// app.use(cors());
// app.use(bodyParser.json());

// const isLocal = process.env.DATABASE_URL.includes("localhost") 
//              || process.env.DATABASE_URL.includes("127.0.0.1");

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: isLocal ? false : { rejectUnauthorized: false },
// });

// // Serve static HTML files
// app.use(express.static(path.join(__dirname)));

// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, "index.html"));
// });

// // Helper to create safe table names
// function getTableName(name) {
//   return "invoice_" + name.toLowerCase().replace(/[^a-z0-9]/g, "_");
// }

// // Initialize tenants table
// async function initDB() {
//   await pool.query(`
//     CREATE TABLE IF NOT EXISTS tenants (
//       id SERIAL PRIMARY KEY,
//       name TEXT UNIQUE NOT NULL,
//       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//     );
//   `);
//   console.log("✅ tenants table ready");
// }
// initDB();

// // Save invoice
// app.post("/api/invoice", async (req, res) => {
//   const client = await pool.connect();
//   try {
//     const {
//       clientName,
//       mobile,
//       invoiceNo,
//       invoiceDate,
//       items,
//       subTotal,
//       roundOff,
//       grandTotal,
//     } = req.body;

//     const tableName = getTableName(clientName);

//     await client.query("BEGIN");

//     // Save client if new
//     await client.query(
//       `INSERT INTO tenants(name) VALUES($1)
//        ON CONFLICT (name) DO NOTHING`,
//       [clientName]
//     );

//     // Create table for client invoices if not exists
//     await client.query(`
//       CREATE TABLE IF NOT EXISTS ${tableName} (
//         id SERIAL PRIMARY KEY,
//         mobile TEXT,
//         invoice_no TEXT,
//         invoice_date TEXT,
//         items JSONB,
//         sub_total NUMERIC,
//         round_off NUMERIC,
//         grand_total NUMERIC,
//         paid_amount NUMERIC DEFAULT 0,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       );
//     `);

//     // Insert invoice
//     await client.query(
//       `INSERT INTO ${tableName}
//       (mobile, invoice_no, invoice_date, items, sub_total, round_off, grand_total)
//       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
//       [
//         mobile,
//         invoiceNo,
//         invoiceDate,
//         JSON.stringify(items),
//         subTotal,
//         roundOff,
//         grandTotal,
//       ]
//     );

//     await client.query("COMMIT");
//     res.json({ message: "Invoice saved successfully" });

//   } catch (err) {
//     await client.query("ROLLBACK");
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   } finally {
//     client.release();
//   }
// });

// // Get all tenants
// app.get("/api/tenants", async (req, res) => {
//   try {
//     const result = await pool.query("SELECT name FROM tenants ORDER BY name");
//     res.json(result.rows);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Search invoices
// app.get("/api/search", async (req, res) => {
//   const { q } = req.query; // search string
//   try {
//     const tenantsRes = await pool.query("SELECT name FROM tenants");
//     const tenants = tenantsRes.rows;

//     let allResults = [];
//     let values = [];

//     for (let t of tenants) {
//       const tableName = getTableName(t.name);

//       const tableCheck = await pool.query(
//         `SELECT to_regclass($1) as exists`,
//         [tableName]
//       );
//       if (!tableCheck.rows[0].exists) continue;

//       let query = `SELECT id, '${t.name}' AS client_name, mobile, invoice_no, invoice_date, 
//                   sub_total, round_off, grand_total, paid_amount,
//                   (grand_total - COALESCE(paid_amount,0)) AS pending_amount
//                   FROM ${tableName}`;
      
//       if (q) {
//         query += ` WHERE '${t.name}' ILIKE $1 OR invoice_no ILIKE $1`;
//         values = [`%${q}%`];
//       }

//       const result = await pool.query(query, values);
//       allResults = allResults.concat(result.rows);
//     }

//     res.json(allResults);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // NEW: Get invoices for a specific client
// app.get("/api/invoices/:clientName", async (req, res) => {
//   try {
//     const { clientName } = req.params;
//     const tableName = getTableName(clientName);

//     // Check if table exists
//     const tableCheck = await pool.query(
//       `SELECT to_regclass($1) as exists`,
//       [tableName]
//     );
    
//     if (!tableCheck.rows[0].exists) {
//       return res.json([]); // Return empty array if no invoices yet
//     }

//     // Get all invoices for this client
//     const result = await pool.query(`
//       SELECT id, mobile, invoice_no, invoice_date, items, 
//              sub_total, round_off, grand_total, paid_amount,
//              (grand_total - COALESCE(paid_amount,0)) AS pending_amount,
//              created_at
//       FROM ${tableName}
//       ORDER BY created_at DESC
//     `);

//     // Parse JSONB items for each invoice
//     const invoices = result.rows.map(invoice => ({
//       ...invoice,
//       items: typeof invoice.items === 'string' 
//         ? JSON.parse(invoice.items) 
//         : invoice.items
//     }));

//     res.json(invoices);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // NEW: Get specific invoice details for a client
// app.get("/api/invoice/:clientName/:invoiceId", async (req, res) => {
//   try {
//     const { clientName, invoiceId } = req.params;
//     const tableName = getTableName(clientName);

//     const result = await pool.query(`
//       SELECT id, mobile, invoice_no, invoice_date, items, 
//              sub_total, round_off, grand_total, paid_amount,
//              (grand_total - COALESCE(paid_amount,0)) AS pending_amount,
//              created_at
//       FROM ${tableName}
//       WHERE id = $1
//     `, [invoiceId]);

//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: "Invoice not found" });
//     }

//     const invoice = result.rows[0];
    
//     // Parse the JSONB items properly
//     const items = typeof invoice.items === 'string' 
//       ? JSON.parse(invoice.items) 
//       : invoice.items;

//     // Create a detailed response with parsed items
//     const detailedInvoice = {
//       ...invoice,
//       items: items,
//       itemCount: items.length
//     };

//     res.json(detailedInvoice);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // Record a payment for an invoice
// app.post("/api/payment", async (req, res) => {
//   const { clientName, invoiceId, amountPaid } = req.body;
//   const client = await pool.connect();

//   try {
//     const tableName = getTableName(clientName);

//     // Update paid amount
//     await client.query(
//       `UPDATE ${tableName} 
//        SET paid_amount = COALESCE(paid_amount,0) + $1
//        WHERE id = $2`,
//       [amountPaid, invoiceId]
//     );

//     res.json({ message: "Payment recorded successfully" });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   } finally {
//     client.release();
//   }
// });

// // NEW: Get invoice summary for a specific client
// app.get("/api/summary/:clientName", async (req, res) => {
//   try {
//     const { clientName } = req.params;
//     const tableName = getTableName(clientName);

//     const tableCheck = await pool.query(
//       `SELECT to_regclass($1) as exists`,
//       [tableName]
//     );
    
//     if (!tableCheck.rows[0].exists) {
//       return res.json({
//         totalInvoices: 0,
//         totalAmount: 0,
//         totalPaid: 0,
//         totalPending: 0
//       });
//     }

//     const summary = await pool.query(`
//       SELECT 
//         COUNT(*) as total_invoices,
//         SUM(grand_total) as total_amount,
//         SUM(COALESCE(paid_amount,0)) as total_paid,
//         SUM(grand_total - COALESCE(paid_amount,0)) as total_pending
//       FROM ${tableName}
//     `);

//     res.json({
//       totalInvoices: parseInt(summary.rows[0].total_invoices) || 0,
//       totalAmount: parseFloat(summary.rows[0].total_amount) || 0,
//       totalPaid: parseFloat(summary.rows[0].total_paid) || 0,
//       totalPending: parseFloat(summary.rows[0].total_pending) || 0
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // Add to your backend code after the existing routes

// // NEW: Get next invoice number
// // Updated: Get next invoice number (backend)
// app.get("/api/invoice/next-number", async (req, res) => {
//   try {
//     const { clientName } = req.query;
//     const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
//     const now = new Date();
//     const currentMonth = monthNames[now.getMonth()];
    
//     // Simple counter table for invoice numbers
//     await pool.query(`
//       CREATE TABLE IF NOT EXISTS invoice_counter (
//         month_year TEXT PRIMARY KEY,
//         last_number INTEGER DEFAULT 0,
//         last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       );
//     `);
    
//     const monthYear = `${currentMonth}_${now.getFullYear()}`;
    
//     // Get or create counter for this month
//     await pool.query(`
//       INSERT INTO invoice_counter (month_year, last_number) 
//       VALUES ($1, 0)
//       ON CONFLICT (month_year) DO NOTHING
//     `, [monthYear]);
    
//     // Increment and get next number
//     const result = await pool.query(`
//       UPDATE invoice_counter 
//       SET last_number = last_number + 1,
//           last_updated = CURRENT_TIMESTAMP
//       WHERE month_year = $1
//       RETURNING last_number
//     `, [monthYear]);
    
//     const nextNumber = result.rows[0].last_number;
//     const invoiceNumber = `${currentMonth}/${nextNumber.toString().padStart(3, '0')}`;
    
//     res.json({ 
//       invoiceNumber,
//       success: true 
//     });
    
//   } catch (err) {
//     console.error("Error generating invoice number:", err);
    
//     // Fallback: Use timestamp-based number
//     const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
//     const now = new Date();
//     const currentMonth = monthNames[now.getMonth()];
//     const timestamp = Date.now() % 1000; // Last 3 digits of timestamp
//     const fallbackNumber = `${currentMonth}/${timestamp.toString().padStart(3, '0')}`;
    
//     res.json({ 
//       invoiceNumber: fallbackNumber,
//       success: false,
//       message: "Using fallback number"
//     });
//   }
// });

// // NEW: Get current invoice number (without incrementing)
// app.get("/api/invoice/current-number", async (req, res) => {
//   try {
//     const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
//     const now = new Date();
//     const currentMonth = monthNames[now.getMonth()];
    
//     // Get the highest invoice number for current month
//     const result = await pool.query(
//       `SELECT MAX(invoice_no) as last_invoice FROM information_schema.tables t
//        CROSS JOIN LATERAL (
//          SELECT MAX(invoice_no) as max_invoice FROM public."${getTableName('temp')}"
//        ) s
//        WHERE table_schema = 'public' AND table_name LIKE 'invoice_%' 
//        AND table_name != 'tenants'`
//     );
    
//     if (result.rows[0].last_invoice) {
//       res.json({ invoiceNumber: result.rows[0].last_invoice });
//     } else {
//       res.json({ invoiceNumber: `${currentMonth}/001` });
//     }
    
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });



// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const bodyParser = require("body-parser");
// const { Pool } = require("pg");
// const path = require("path");
// const app = express();
// app.use(express.json());
// app.use(cors());
// app.use(bodyParser.json());

// const isLocal = process.env.DATABASE_URL.includes("localhost") 
//              || process.env.DATABASE_URL.includes("127.0.0.1");

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: isLocal ? false : { rejectUnauthorized: false },
// });

// // Serve static HTML files
// app.use(express.static(path.join(__dirname)));

// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, "index.html"));
// });

// // Helper to create safe table names
// function getTableName(name) {
//   return "invoice_" + name.toLowerCase().replace(/[^a-z0-9]/g, "_");
// }

// // Initialize tenants and payments table
// async function initDB() {
//   await pool.query(`
//     CREATE TABLE IF NOT EXISTS tenants (
//       id SERIAL PRIMARY KEY,
//       name TEXT UNIQUE NOT NULL,
//       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//     );
//   `);
  
//   await pool.query(`
//     CREATE TABLE IF NOT EXISTS payments_history (
//       id SERIAL PRIMARY KEY,
//       client_name TEXT NOT NULL,
//       invoice_id INTEGER NOT NULL,
//       invoice_no TEXT NOT NULL,
//       payment_amount DECIMAL(10,2) NOT NULL,
//       payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//       remaining_balance DECIMAL(10,2) NOT NULL,
//       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//     );
//   `);
//   console.log("✅ Database tables ready");
// }
// initDB();

// // Save invoice
// app.post("/api/invoice", async (req, res) => {
//   const client = await pool.connect();
//   try {
//     const {
//       clientName,
//       mobile,
//       invoiceNo,
//       invoiceDate,
//       items,
//       subTotal,
//       roundOff,
//       grandTotal,
//     } = req.body;

//     const tableName = getTableName(clientName);

//     await client.query("BEGIN");

//     // Save client if new
//     await client.query(
//       `INSERT INTO tenants(name) VALUES($1)
//        ON CONFLICT (name) DO NOTHING`,
//       [clientName]
//     );

//     // Create table for client invoices if not exists
//     await client.query(`
//       CREATE TABLE IF NOT EXISTS ${tableName} (
//         id SERIAL PRIMARY KEY,
//         mobile TEXT,
//         invoice_no TEXT,
//         invoice_date TEXT,
//         items JSONB,
//         sub_total NUMERIC,
//         round_off NUMERIC,
//         grand_total NUMERIC,
//         paid_amount NUMERIC DEFAULT 0,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       );
//     `);

//     // Insert invoice
//     await client.query(
//       `INSERT INTO ${tableName}
//       (mobile, invoice_no, invoice_date, items, sub_total, round_off, grand_total)
//       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
//       [
//         mobile,
//         invoiceNo,
//         invoiceDate,
//         JSON.stringify(items),
//         subTotal,
//         roundOff,
//         grandTotal,
//       ]
//     );

//     await client.query("COMMIT");
//     res.json({ message: "Invoice saved successfully" });

//   } catch (err) {
//     await client.query("ROLLBACK");
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   } finally {
//     client.release();
//   }
// });

// // Get all tenants
// app.get("/api/tenants", async (req, res) => {
//   try {
//     const result = await pool.query("SELECT name FROM tenants ORDER BY name");
//     res.json(result.rows);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Search invoices
// app.get("/api/search", async (req, res) => {
//   const { q } = req.query;
//   try {
//     const tenantsRes = await pool.query("SELECT name FROM tenants");
//     const tenants = tenantsRes.rows;

//     let allResults = [];
//     let values = [];

//     for (let t of tenants) {
//       const tableName = getTableName(t.name);

//       const tableCheck = await pool.query(
//         `SELECT to_regclass($1) as exists`,
//         [tableName]
//       );
//       if (!tableCheck.rows[0].exists) continue;

//       let query = `SELECT id, '${t.name}' AS client_name, mobile, invoice_no, invoice_date, 
//                   sub_total, round_off, grand_total, paid_amount,
//                   (grand_total - COALESCE(paid_amount,0)) AS pending_amount
//                   FROM ${tableName}`;
      
//       if (q) {
//         query += ` WHERE '${t.name}' ILIKE $1 OR invoice_no ILIKE $1`;
//         values = [`%${q}%`];
//       }

//       const result = await pool.query(query, values);
//       allResults = allResults.concat(result.rows);
//     }

//     res.json(allResults);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // Get invoices for a specific client
// app.get("/api/invoices/:clientName", async (req, res) => {
//   try {
//     const { clientName } = req.params;
//     const tableName = getTableName(clientName);

//     const tableCheck = await pool.query(
//       `SELECT to_regclass($1) as exists`,
//       [tableName]
//     );
    
//     if (!tableCheck.rows[0].exists) {
//       return res.json([]);
//     }

//     const result = await pool.query(`
//       SELECT id, mobile, invoice_no, invoice_date, items, 
//              sub_total, round_off, grand_total, paid_amount,
//              (grand_total - COALESCE(paid_amount,0)) AS pending_amount,
//              created_at
//       FROM ${tableName}
//       ORDER BY created_at DESC
//     `);

//     const invoices = result.rows.map(invoice => ({
//       ...invoice,
//       items: typeof invoice.items === 'string' 
//         ? JSON.parse(invoice.items) 
//         : invoice.items
//     }));

//     res.json(invoices);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // Get specific invoice details for a client
// app.get("/api/invoice/:clientName/:invoiceId", async (req, res) => {
//   try {
//     const { clientName, invoiceId } = req.params;
//     const tableName = getTableName(clientName);

//     const result = await pool.query(`
//       SELECT id, mobile, invoice_no, invoice_date, items, 
//              sub_total, round_off, grand_total, paid_amount,
//              (grand_total - COALESCE(paid_amount,0)) AS pending_amount,
//              created_at
//       FROM ${tableName}
//       WHERE id = $1
//     `, [invoiceId]);

//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: "Invoice not found" });
//     }

//     const invoice = result.rows[0];
    
//     const items = typeof invoice.items === 'string' 
//       ? JSON.parse(invoice.items) 
//       : invoice.items;

//     const detailedInvoice = {
//       ...invoice,
//       items: items,
//       itemCount: items.length
//     };

//     res.json(detailedInvoice);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });


// // Record a payment for an invoice - Updated with better error handling
// app.post("/api/payment", async (req, res) => {
//   const { clientName, invoiceId, amountPaid } = req.body;
//   const client = await pool.connect();

//   try {
//     const tableName = getTableName(clientName);

//     await client.query("BEGIN");

//     // Get current invoice details
//     const invoiceResult = await client.query(
//       `SELECT invoice_no, grand_total, paid_amount FROM ${tableName} WHERE id = $1`,
//       [invoiceId]
//     );

//     if (invoiceResult.rows.length === 0) {
//       throw new Error("Invoice not found");
//     }

//     const invoice = invoiceResult.rows[0];
//     const currentPaid = parseFloat(invoice.paid_amount || 0);
//     const grandTotal = parseFloat(invoice.grand_total);
//     const newPaidAmount = currentPaid + parseFloat(amountPaid);
    
//     if (newPaidAmount > grandTotal) {
//       throw new Error("Payment amount exceeds invoice total");
//     }

//     // Calculate remaining balance after this payment
//     const remainingBalance = grandTotal - newPaidAmount;

//     // Record payment in history (always record, even if payment is 0)
//     await client.query(
//       `INSERT INTO payments_history 
//        (client_name, invoice_id, invoice_no, payment_amount, remaining_balance)
//        VALUES ($1, $2, $3, $4, $5)`,
//       [clientName, invoiceId, invoice.invoice_no, amountPaid, remainingBalance]
//     );

//     // Update paid amount in invoice table
//     await client.query(
//       `UPDATE ${tableName} 
//        SET paid_amount = $1
//        WHERE id = $2`,
//       [newPaidAmount, invoiceId]
//     );

//     await client.query("COMMIT");
    
//     // Get the payment record we just created
//     const paymentRecord = await pool.query(`
//       SELECT id, client_name, invoice_id, invoice_no, 
//              payment_amount, remaining_balance,
//              TO_CHAR(payment_date, 'YYYY-MM-DD HH24:MI:SS') as payment_date,
//              TO_CHAR(payment_date, 'DD Mon YYYY') as formatted_date
//       FROM payments_history
//       WHERE id = (SELECT MAX(id) FROM payments_history 
//                   WHERE client_name = $1 AND invoice_id = $2)
//     `, [clientName, invoiceId]);
    
//     res.json({ 
//       success: true,
//       message: "Payment recorded successfully",
//       paymentRecord: paymentRecord.rows[0],
//       newPaidAmount: newPaidAmount,
//       remainingBalance: remainingBalance
//     });

//   } catch (err) {
//     await client.query("ROLLBACK");
//     console.error("Payment recording error:", err);
//     res.status(500).json({ 
//       success: false,
//       error: err.message 
//     });
//   } finally {
//     client.release();
//   }
// });


// // Get payment history for a client (all invoices)
// app.get("/api/payments/:clientName", async (req, res) => {
//   try {
//     const { clientName } = req.params;

//     const result = await pool.query(`
//       SELECT id, client_name, invoice_id, invoice_no, 
//              payment_amount, remaining_balance,
//              TO_CHAR(payment_date, 'YYYY-MM-DD HH24:MI:SS') as payment_date,
//              TO_CHAR(payment_date, 'DD Mon YYYY') as formatted_date,
//              created_at
//       FROM payments_history
//       WHERE client_name = $1
//       ORDER BY payment_date DESC
//     `, [clientName]);

//     res.json(result.rows);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // Get payment history for a specific invoice (keep existing)
// app.get("/api/payments/:clientName/:invoiceId", async (req, res) => {
//   try {
//     const { clientName, invoiceId } = req.params;

//     const result = await pool.query(`
//       SELECT id, client_name, invoice_id, invoice_no, 
//              payment_amount, remaining_balance,
//              TO_CHAR(payment_date, 'YYYY-MM-DD HH24:MI:SS') as payment_date,
//              TO_CHAR(payment_date, 'DD Mon YYYY') as formatted_date,
//              created_at
//       FROM payments_history
//       WHERE client_name = $1 AND invoice_id = $2
//       ORDER BY payment_date DESC
//     `, [clientName, invoiceId]);

//     res.json(result.rows);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });



// // Get payment history for an invoice
// app.get("/api/payments/:clientName/:invoiceId", async (req, res) => {
//   try {
//     const { clientName, invoiceId } = req.params;

//     const result = await pool.query(`
//       SELECT id, client_name, invoice_id, invoice_no, 
//              payment_amount, remaining_balance,
//              TO_CHAR(payment_date, 'YYYY-MM-DD HH24:MI:SS') as payment_date,
//              TO_CHAR(payment_date, 'DD Mon YYYY') as formatted_date
//       FROM payments_history
//       WHERE client_name = $1 AND invoice_id = $2
//       ORDER BY payment_date DESC
//     `, [clientName, invoiceId]);

//     res.json(result.rows);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // Get invoice summary for a specific client
// app.get("/api/summary/:clientName", async (req, res) => {
//   try {
//     const { clientName } = req.params;
//     const tableName = getTableName(clientName);

//     const tableCheck = await pool.query(
//       `SELECT to_regclass($1) as exists`,
//       [tableName]
//     );
    
//     if (!tableCheck.rows[0].exists) {
//       return res.json({
//         totalInvoices: 0,
//         totalAmount: 0,
//         totalPaid: 0,
//         totalPending: 0
//       });
//     }

//     const summary = await pool.query(`
//       SELECT 
//         COUNT(*) as total_invoices,
//         SUM(grand_total) as total_amount,
//         SUM(COALESCE(paid_amount,0)) as total_paid,
//         SUM(grand_total - COALESCE(paid_amount,0)) as total_pending
//       FROM ${tableName}
//     `);

//     res.json({
//       totalInvoices: parseInt(summary.rows[0].total_invoices) || 0,
//       totalAmount: parseFloat(summary.rows[0].total_amount) || 0,
//       totalPaid: parseFloat(summary.rows[0].total_paid) || 0,
//       totalPending: parseFloat(summary.rows[0].total_pending) || 0
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // Get next invoice number
// app.get("/api/invoice/next-number", async (req, res) => {
//   try {
//     const { clientName } = req.query;
//     const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
//     const now = new Date();
//     const currentMonth = monthNames[now.getMonth()];
    
//     await pool.query(`
//       CREATE TABLE IF NOT EXISTS invoice_counter (
//         month_year TEXT PRIMARY KEY,
//         last_number INTEGER DEFAULT 0,
//         last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       );
//     `);
    
//     const monthYear = `${currentMonth}_${now.getFullYear()}`;
    
//     await pool.query(`
//       INSERT INTO invoice_counter (month_year, last_number) 
//       VALUES ($1, 0)
//       ON CONFLICT (month_year) DO NOTHING
//     `, [monthYear]);
    
//     const result = await pool.query(`
//       UPDATE invoice_counter 
//       SET last_number = last_number + 1,
//           last_updated = CURRENT_TIMESTAMP
//       WHERE month_year = $1
//       RETURNING last_number
//     `, [monthYear]);
    
//     const nextNumber = result.rows[0].last_number;
//     const invoiceNumber = `${currentMonth}/${nextNumber.toString().padStart(3, '0')}`;
    
//     res.json({ 
//       invoiceNumber,
//       success: true 
//     });
    
//   } catch (err) {
//     console.error("Error generating invoice number:", err);
//     const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
//     const now = new Date();
//     const currentMonth = monthNames[now.getMonth()];
//     const timestamp = Date.now() % 1000;
//     const fallbackNumber = `${currentMonth}/${timestamp.toString().padStart(3, '0')}`;
    
//     res.json({ 
//       invoiceNumber: fallbackNumber,
//       success: false,
//       message: "Using fallback number"
//     });
//   }
// });

// // Get current invoice number
// app.get("/api/invoice/current-number", async (req, res) => {
//   try {
//     const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
//     const now = new Date();
//     const currentMonth = monthNames[now.getMonth()];
    
//     const result = await pool.query(
//       `SELECT MAX(invoice_no) as last_invoice FROM information_schema.tables t
//        CROSS JOIN LATERAL (
//          SELECT MAX(invoice_no) as max_invoice FROM public."${getTableName('temp')}"
//        ) s
//        WHERE table_schema = 'public' AND table_name LIKE 'invoice_%' 
//        AND table_name != 'tenants'`
//     );
    
//     if (result.rows[0].last_invoice) {
//       res.json({ invoiceNumber: result.rows[0].last_invoice });
//     } else {
//       res.json({ invoiceNumber: `${currentMonth}/001` });
//     }
    
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });


// --databse delete
// -- SELECT pg_terminate_backend(pid)
// -- FROM pg_stat_activity
// -- WHERE datname = 'adeshtest'
// --   AND pid <> pg_backend_pid();

// -- DROP DATABASE adeshtest;
// -- CREATE DATABASE adeshtest;



require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const path = require("path");
const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

const isLocal = process.env.DATABASE_URL.includes("localhost") 
             || process.env.DATABASE_URL.includes("127.0.0.1");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // ssl: isLocal ? false : { rejectUnauthorized: false },
    ssl: {
    ca: fs.readFileSync("./ca.pem").toString()
  }
});

// Serve static HTML files
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/clients", (req, res) => {
  res.sendFile(path.join(__dirname, "clients.html"));
});

app.get("/invoices", (req, res) => {
  res.sendFile(path.join(__dirname, "invoices.html"));
});

// Helper to create safe table names
function getTableName(name) {
  return "invoice_" + name.toLowerCase().replace(/[^a-z0-9]/g, "_");
}

// Initialize tenants and payments table
// async function initDB() {
//   await pool.query(`
//     CREATE TABLE IF NOT EXISTS tenants (
//       id SERIAL PRIMARY KEY,
//       name TEXT UNIQUE NOT NULL,
//       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//     );
//   `);
  
//   await pool.query(`
//     CREATE TABLE IF NOT EXISTS payments_history (
//       id SERIAL PRIMARY KEY,
//       client_name TEXT NOT NULL,
//       invoice_id INTEGER NOT NULL,
//       invoice_no TEXT NOT NULL,
//       payment_amount DECIMAL(10,2) NOT NULL,
//       payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//       remaining_balance DECIMAL(10,2) NOT NULL,
//       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//     );
//   `);
//   console.log("✅ Database tables ready");
// }



async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tenants (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  await pool.query(`
    CREATE TABLE IF NOT EXISTS payments_history (
      id SERIAL PRIMARY KEY,
      client_name TEXT NOT NULL,
      invoice_id INTEGER NOT NULL,
      invoice_no TEXT NOT NULL,
      payment_amount DECIMAL(10,2) NOT NULL,
      payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      remaining_balance DECIMAL(10,2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  await pool.query(`
    CREATE TABLE IF NOT EXISTS invoice_counter (
      month_year TEXT PRIMARY KEY,
      last_number INTEGER DEFAULT 0,
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  console.log("✅ Database tables ready");
}
initDB();

// Save invoice
app.post("/api/invoice", async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      clientName,
      mobile,
      invoiceNo,
      invoiceDate,
      items,
      subTotal,
      roundOff,
      grandTotal,
    } = req.body;

    const tableName = getTableName(clientName);

    await client.query("BEGIN");

    // Save client if new
    await client.query(
      `INSERT INTO tenants(name) VALUES($1)
       ON CONFLICT (name) DO NOTHING`,
      [clientName]
    );

    // Create table for client invoices if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS ${tableName} (
        id SERIAL PRIMARY KEY,
        mobile TEXT,
        invoice_no TEXT,
        invoice_date TEXT,
        items JSONB,
        sub_total NUMERIC,
        round_off NUMERIC,
        grand_total NUMERIC,
        paid_amount NUMERIC DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insert invoice
    await client.query(
      `INSERT INTO ${tableName}
      (mobile, invoice_no, invoice_date, items, sub_total, round_off, grand_total)
      VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [
        mobile,
        invoiceNo,
        invoiceDate,
        JSON.stringify(items),
        subTotal,
        roundOff,
        grandTotal,
      ]
    );

    await client.query("COMMIT");
    res.json({ message: "Invoice saved successfully" });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// Get all tenants
app.get("/api/tenants", async (req, res) => {
  try {
    const result = await pool.query("SELECT name FROM tenants ORDER BY name");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Search invoices
app.get("/api/search", async (req, res) => {
  const { q } = req.query;
  try {
    const tenantsRes = await pool.query("SELECT name FROM tenants");
    const tenants = tenantsRes.rows;

    let allResults = [];
    let values = [];

    for (let t of tenants) {
      const tableName = getTableName(t.name);

      const tableCheck = await pool.query(
        `SELECT to_regclass($1) as exists`,
        [tableName]
      );
      if (!tableCheck.rows[0].exists) continue;

      let query = `SELECT id, '${t.name}' AS client_name, mobile, invoice_no, invoice_date, 
                  sub_total, round_off, grand_total, paid_amount,
                  (grand_total - COALESCE(paid_amount,0)) AS pending_amount
                  FROM ${tableName}`;
      
      if (q) {
        query += ` WHERE '${t.name}' ILIKE $1 OR invoice_no ILIKE $1`;
        values = [`%${q}%`];
      }

      const result = await pool.query(query, values);
      allResults = allResults.concat(result.rows);
    }

    res.json(allResults);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get invoices for a specific client
app.get("/api/invoices/:clientName", async (req, res) => {
  try {
    const { clientName } = req.params;
    const tableName = getTableName(clientName);

    const tableCheck = await pool.query(
      `SELECT to_regclass($1) as exists`,
      [tableName]
    );
    
    if (!tableCheck.rows[0].exists) {
      return res.json([]);
    }

    const result = await pool.query(`
      SELECT id, mobile, invoice_no, invoice_date, items, 
             sub_total, round_off, grand_total, paid_amount,
             (grand_total - COALESCE(paid_amount,0)) AS pending_amount,
             created_at
      FROM ${tableName}
      ORDER BY created_at DESC
    `);

    const invoices = result.rows.map(invoice => ({
      ...invoice,
      items: typeof invoice.items === 'string' 
        ? JSON.parse(invoice.items) 
        : invoice.items
    }));

    res.json(invoices);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get specific invoice details for a client
app.get("/api/invoice/:clientName/:invoiceId", async (req, res) => {
  try {
    const { clientName, invoiceId } = req.params;
    const tableName = getTableName(clientName);

    const result = await pool.query(`
      SELECT id, mobile, invoice_no, invoice_date, items, 
             sub_total, round_off, grand_total, paid_amount,
             (grand_total - COALESCE(paid_amount,0)) AS pending_amount,
             created_at
      FROM ${tableName}
      WHERE id = $1
    `, [invoiceId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    const invoice = result.rows[0];
    
    const items = typeof invoice.items === 'string' 
      ? JSON.parse(invoice.items) 
      : invoice.items;

    const detailedInvoice = {
      ...invoice,
      items: items,
      itemCount: items.length
    };

    res.json(detailedInvoice);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Record a payment for an invoice
app.post("/api/payment", async (req, res) => {
  const { clientName, invoiceId, amountPaid } = req.body;
  const client = await pool.connect();

  try {
    const tableName = getTableName(clientName);

    await client.query("BEGIN");

    // Get current invoice details
    const invoiceResult = await client.query(
      `SELECT invoice_no, grand_total, paid_amount FROM ${tableName} WHERE id = $1`,
      [invoiceId]
    );

    if (invoiceResult.rows.length === 0) {
      throw new Error("Invoice not found");
    }

    const invoice = invoiceResult.rows[0];
    const currentPaid = parseFloat(invoice.paid_amount || 0);
    const grandTotal = parseFloat(invoice.grand_total);
    const newPaidAmount = currentPaid + parseFloat(amountPaid);
    
    if (newPaidAmount > grandTotal) {
      throw new Error("Payment amount exceeds invoice total");
    }

    // Calculate remaining balance after this payment
    const remainingBalance = grandTotal - newPaidAmount;

    // Record payment in history
    await client.query(
      `INSERT INTO payments_history 
       (client_name, invoice_id, invoice_no, payment_amount, remaining_balance)
       VALUES ($1, $2, $3, $4, $5)`,
      [clientName, invoiceId, invoice.invoice_no, amountPaid, remainingBalance]
    );

    // Update paid amount in invoice table
    await client.query(
      `UPDATE ${tableName} 
       SET paid_amount = $1
       WHERE id = $2`,
      [newPaidAmount, invoiceId]
    );

    await client.query("COMMIT");
    
    res.json({ 
      success: true,
      message: "Payment recorded successfully",
      paymentId: null,
      newPaidAmount: newPaidAmount,
      remainingBalance: remainingBalance
    });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  } finally {
    client.release();
  }
});

// Get payment history for a client (all invoices)
app.get("/api/payments/:clientName", async (req, res) => {
  try {
    const { clientName } = req.params;

    const result = await pool.query(`
      SELECT id, client_name, invoice_id, invoice_no, 
             payment_amount, remaining_balance,
             TO_CHAR(payment_date, 'YYYY-MM-DD HH24:MI:SS') as payment_date,
             TO_CHAR(payment_date, 'DD Mon YYYY') as formatted_date,
             created_at
      FROM payments_history
      WHERE client_name = $1
      ORDER BY payment_date DESC
    `, [clientName]);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get payment history for a specific invoice
app.get("/api/payments/:clientName/:invoiceId", async (req, res) => {
  try {
    const { clientName, invoiceId } = req.params;

    const result = await pool.query(`
      SELECT id, client_name, invoice_id, invoice_no, 
             payment_amount, remaining_balance,
             TO_CHAR(payment_date, 'YYYY-MM-DD HH24:MI:SS') as payment_date,
             TO_CHAR(payment_date, 'DD Mon YYYY') as formatted_date,
             created_at
      FROM payments_history
      WHERE client_name = $1 AND invoice_id = $2
      ORDER BY payment_date DESC
    `, [clientName, invoiceId]);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get invoice summary for a specific client (for PDF pending amount)
app.get("/api/summary/:clientName", async (req, res) => {
  try {
    const { clientName } = req.params;
    const tableName = getTableName(clientName);

    const tableCheck = await pool.query(
      `SELECT to_regclass($1) as exists`,
      [tableName]
    );
    
    if (!tableCheck.rows[0].exists) {
      return res.json({
        totalInvoices: 0,
        totalAmount: 0,
        totalPaid: 0,
        totalPending: 0
      });
    }

    const summary = await pool.query(`
      SELECT 
        COUNT(*) as total_invoices,
        SUM(grand_total) as total_amount,
        SUM(COALESCE(paid_amount,0)) as total_paid,
        SUM(grand_total - COALESCE(paid_amount,0)) as total_pending
      FROM ${tableName}
    `);

    res.json({
      totalInvoices: parseInt(summary.rows[0].total_invoices) || 0,
      totalAmount: parseFloat(summary.rows[0].total_amount) || 0,
      totalPaid: parseFloat(summary.rows[0].total_paid) || 0,
      totalPending: parseFloat(summary.rows[0].total_pending) || 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get current invoice number (without incrementing)
app.get("/api/invoice/current-number", async (req, res) => {
  try {
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const now = new Date();
    const currentMonth = monthNames[now.getMonth()];
    
    // Get all tenant tables
    const tenantTables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'invoice_%'
    `);
    
    let maxNumber = 0;
    let foundInvoice = null;
    
    // Check each client's invoice table for the highest invoice number of current month
    for (const table of tenantTables.rows) {
      try {
        const result = await pool.query(`
          SELECT invoice_no, created_at
          FROM ${table.table_name}
          WHERE invoice_no LIKE $1
          ORDER BY created_at DESC
          LIMIT 1
        `, [`${currentMonth}/%`]);
        
        if (result.rows.length > 0) {
          const invoiceNo = result.rows[0].invoice_no;
          const match = invoiceNo.match(/^[A-Z]{3}\/(\d+)$/);
          if (match) {
            const num = parseInt(match[1]);
            if (num > maxNumber) {
              maxNumber = num;
              foundInvoice = invoiceNo;
            }
          }
        }
      } catch (err) {
        continue;
      }
    }
    
    if (foundInvoice) {
      res.json({ 
        invoiceNumber: foundInvoice,
        success: true 
      });
    } else {
      // Check counter table as fallback
      const currentYear = now.getFullYear();
      const monthYear = `${currentMonth}_${currentYear}`;
      
      const counterResult = await pool.query(
        'SELECT last_number FROM invoice_counter WHERE month_year = $1',
        [monthYear]
      );
      
      if (counterResult.rows.length > 0) {
        const lastNumber = counterResult.rows[0].last_number;
        const invoiceNumber = `${currentMonth}/${lastNumber.toString().padStart(3, '0')}`;
        res.json({ 
          invoiceNumber,
          success: true 
        });
      } else {
        // No invoices yet this month
        res.json({ 
          invoiceNumber: `${currentMonth}/000`,
          success: true 
        });
      }
    }
    
  } catch (err) {
    console.error("Error getting current invoice number:", err);
    
    // Fallback
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const now = new Date();
    const currentMonth = monthNames[now.getMonth()];
    
    res.json({ 
      invoiceNumber: `${currentMonth}/000`,
      success: false,
      message: "Using fallback"
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});