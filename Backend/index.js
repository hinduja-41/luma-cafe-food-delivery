require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const PORT = process.env.PORT || 5000;

const app = express();

// =========================================
// MIDDLEWARE
// =========================================

// =========================================
// MIDDLEWARE
// =========================================

app.use(cors());

app.options(/.*/, cors());

app.use(express.json());





// =========================================
// MYSQL DATABASE CONNECTION
// =========================================
const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});


// =========================================
// TEST DATABASE CONNECTION
// =========================================

async function startServer() {
    try {
        const connection = await db.getConnection();

        console.log("MySQL database connected successfully! ✅");

        connection.release();

        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (error) {
        console.error("MySQL connection failed ❌");
        console.error(error.message);
        process.exit(1);
    }
}

startServer();


// =========================================
// HOME ROUTE
// =========================================

app.get("/", (req, res) => {

    res.send("Luma Café Backend is running! 🚀");

});


// =========================================
// MENU API
// GET ALL MENU ITEMS FROM MYSQL
// =========================================

app.get("/api/menu", async (req, res) => {

    try {

        const [rows] = await db.query(
            "SELECT * FROM menu ORDER BY id ASC"
        );

        res.json(rows);

    } catch (error) {

        console.error("Error fetching menu:", error.message);

        res.status(500).json({
            error: "Failed to fetch menu"
        });

    }

});
// =========================================
// ORDERS API
// GET ALL ORDERS
// =========================================

app.get("/api/orders", async (req, res) => {

    try {

        const [rows] = await db.query(
            "SELECT * FROM orders ORDER BY id DESC"
        );

        res.json(rows);

    } catch (error) {

        console.error(
            "Error fetching orders:",
            error.message
        );

        res.status(500).json({
            error: "Failed to fetch orders"
        });

    }

});

// =========================================
// ORDER API
// SAVE CUSTOMER ORDER TO MYSQL
// =========================================

// =========================================
// ORDER API
// SAVE CUSTOMER ORDER TO MYSQL
// =========================================

app.post("/api/orders", async (req, res) => {

    try {

        const {
            customer_id,
            customer_name,
            customer_phone,
            customer_address,
            items,
            total_amount
        } = req.body;


        // Validate required fields
        if (
            !customer_id ||
            !customer_name ||
            !customer_phone ||
            !customer_address ||
            !items ||
            items.length === 0 ||
            total_amount === undefined
        ) {

            return res.status(400).json({
                error: "Please provide all required order details."
            });

        }


        // Insert order into MySQL
        const [result] = await db.query(
            `INSERT INTO orders
            (customer_id, customer_name, customer_phone, customer_address, items, total_amount)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                customer_id,
                customer_name,
                customer_phone,
                customer_address,
                JSON.stringify(items),
                total_amount
            ]
        );


        // Send success response
        res.status(201).json({

            message: "Order placed successfully! 🎉",

            orderId: result.insertId

        });


    } catch (error) {

        console.error(
            "Error placing order:",
            error.message
        );

        res.status(500).json({
            error: "Failed to place order."
        });

    }

});
// =========================================
// UPDATE ORDER STATUS
// =========================================

app.put("/api/orders/:id/status", async (req, res) => {

    try {

        const orderId = req.params.id;
        const { status } = req.body;

        const allowedStatuses = [
            "Pending",
            "Preparing",
            "Out for Delivery",
            "Delivered"
        ];

        if (!allowedStatuses.includes(status)) {

            return res.status(400).json({
                error: "Invalid order status"
            });

        }

        await db.query(
            "UPDATE orders SET status = ? WHERE id = ?",
            [status, orderId]
        );

        res.json({
            message: "Order status updated successfully"
        });

    } catch (error) {

        console.error(
            "Error updating order status:",
            error.message
        );

        res.status(500).json({
            error: "Failed to update order status"
        });

    }

});
// =========================================
// GET SINGLE ORDER
// =========================================

app.get("/api/orders/:id", async (req, res) => {

    try {

        const orderId = req.params.id;

        const [rows] = await db.query(
            "SELECT * FROM orders WHERE id = ?",
            [orderId]
        );

        if (rows.length === 0) {

            return res.status(404).json({
                error: "Order not found"
            });

        }

        res.json(rows[0]);

    } catch (error) {

        console.error(
            "Error fetching order:",
            error.message
        );

        res.status(500).json({
            error: "Failed to fetch order"
        });

    }

});
// =========================================
// GET CUSTOMER ORDER HISTORY
// =========================================

app.get("/api/orders/customer/:customerId", async (req, res) => {

    try {

        const customerId = req.params.customerId;

        const [rows] = await db.query(
            `SELECT id,
                    customer_id,
                    customer_name,
                    customer_phone,
                    customer_address,
                    items,
                    total_amount,
                    status,
                    created_at
             FROM orders
             WHERE customer_id = ?
             ORDER BY id DESC`,
            [customerId]
        );

        res.json(rows);

    } catch (error) {

        console.error(
            "Error fetching customer orders:",
            error.message
        );

        res.status(500).json({
            error: "Failed to fetch customer orders"
        });

    }

});


// =========================================
// CUSTOMER SIGNUP
// =========================================

app.post("/api/customers/signup", async (req, res) => {

    try {

        const {
            name,
            email,
            phone,
            password
        } = req.body;

        // Check required fields
        if (!name || !email || !phone || !password) {

            return res.status(400).json({
                error: "All fields are required"
            });

        }

        // Check whether email or phone already exists
        const [existingCustomer] = await db.query(
            `SELECT id
             FROM customers
             WHERE email = ? OR phone = ?`,
            [email, phone]
        );

        if (existingCustomer.length > 0) {

            return res.status(409).json({
                error: "Email or phone number already registered"
            });

        }

        // Create new customer
        const [result] = await db.query(
            `INSERT INTO customers
                (name, email, phone, password)
             VALUES (?, ?, ?, ?)`,
            [name, email, phone, password]
        );

        res.status(201).json({
            message: "Account created successfully",
            customerId: result.insertId
        });

    } catch (error) {

        console.error(
            "Signup error:",
            error.message
        );

        res.status(500).json({
            error: "Failed to create account"
        });

    }

});


// =========================================
// CUSTOMER LOGIN
// =========================================

app.post("/api/customers/login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;

        // Check required fields
        if (!email || !password) {

            return res.status(400).json({
                error: "Email and password are required"
            });

        }

        // Find customer by email
        const [rows] = await db.query(
            `SELECT id, name, email, phone, password
             FROM customers
             WHERE email = ?`,
            [email]
        );

        // Customer not found
        if (rows.length === 0) {

            return res.status(401).json({
                error: "Invalid email or password"
            });

        }

        const customer = rows[0];

        // Check password
        if (customer.password !== password) {

            return res.status(401).json({
                error: "Invalid email or password"
            });

        }

        // Don't send password to browser
        delete customer.password;

        res.json({
            message: "Login successful",
            customer: customer
        });

    } catch (error) {

        console.error(
            "Login error:",
            error.message
        );

        res.status(500).json({
            error: "Failed to login"
        });

    }

});

// =========================================
// ADMIN LOGIN
// =========================================

app.post("/api/admin/login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        // Check required fields
        if (!email || !password) {

            return res.status(400).json({
                error: "Email and password are required"
            });

        }


        // Find admin by email
        const [rows] = await db.query(
            `SELECT id, name, email, password
             FROM admins
             WHERE email = ?`,
            [email]
        );


        // Admin not found
        if (rows.length === 0) {

            return res.status(401).json({
                error: "Invalid admin email or password"
            });

        }


        const admin = rows[0];


        // Check password
        if (admin.password !== password) {

            return res.status(401).json({
                error: "Invalid admin email or password"
            });

        }


        // Don't send password to browser
        delete admin.password;


        res.json({
            message: "Admin login successful",
            admin: admin
        });


    } catch (error) {

        console.error(
            "Admin login error:",
            error.message
        );


        res.status(500).json({
            error: "Failed to login as admin"
        });

    }

});

// =========================================
// CANCEL ORDER
// =========================================

app.put("/api/orders/:id/cancel", async (req, res) => {

    try {

        const orderId = req.params.id;

        const [result] = await db.query(
            `UPDATE orders
             SET status = 'Cancelled'
             WHERE id = ?
             AND status = 'Pending'`,
            [orderId]
        );

        if (result.affectedRows === 0) {

            return res.status(400).json({
                error:
                    "Order cannot be cancelled. It may already be processed."
            });

        }

        res.json({
            message:
                "Order cancelled successfully"
        });

    } catch (error) {

        console.error(
            "Error cancelling order:",
            error.message
        );

        res.status(500).json({
            error:
                "Failed to cancel order"
        });

    }

});


// =========================================
// START SERVER
// =========================================

