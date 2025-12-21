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











require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Pool } = require("pg");

const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL
    ? { rejectUnauthorized: false }
    : false,
});


// Helper to create safe table names
function getTableName(name) {
  return "invoice_" + name.toLowerCase().replace(/[^a-z0-9]/g, "_");
}

// Initialize tenants table
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tenants (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log("✅ tenants table ready");
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
  const { q } = req.query; // search string
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

// NEW: Get invoices for a specific client
app.get("/api/invoices/:clientName", async (req, res) => {
  try {
    const { clientName } = req.params;
    const tableName = getTableName(clientName);

    // Check if table exists
    const tableCheck = await pool.query(
      `SELECT to_regclass($1) as exists`,
      [tableName]
    );
    
    if (!tableCheck.rows[0].exists) {
      return res.json([]); // Return empty array if no invoices yet
    }

    // Get all invoices for this client
    const result = await pool.query(`
      SELECT id, mobile, invoice_no, invoice_date, items, 
             sub_total, round_off, grand_total, paid_amount,
             (grand_total - COALESCE(paid_amount,0)) AS pending_amount,
             created_at
      FROM ${tableName}
      ORDER BY created_at DESC
    `);

    // Parse JSONB items for each invoice
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

// NEW: Get specific invoice details for a client
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
    
    // Parse the JSONB items properly
    const items = typeof invoice.items === 'string' 
      ? JSON.parse(invoice.items) 
      : invoice.items;

    // Create a detailed response with parsed items
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

    // Update paid amount
    await client.query(
      `UPDATE ${tableName} 
       SET paid_amount = COALESCE(paid_amount,0) + $1
       WHERE id = $2`,
      [amountPaid, invoiceId]
    );

    res.json({ message: "Payment recorded successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// NEW: Get invoice summary for a specific client
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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
