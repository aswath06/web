const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "online_store"
});

db.connect(err => {
    if (err) {
        console.error("MySQL connection error:", err);
        process.exit(1);
    }
    console.log("Connected to MySQL!");
});

app.get("/products", (req, res) => {
    db.query("SELECT * FROM products", (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json(results);
    });
});

app.post("/products", (req, res) => {
    const { name, price, description, category, stock } = req.body;
    const query = "INSERT INTO products (name, price, description, category, stock) VALUES (?, ?, ?, ?, ?)";
    db.query(query, [name, price, description, category, stock], (err, result) => {
        if (err) return res.status(500).json({ error: "Insert failed" });
        res.status(201).json({ id: result.insertId, name, price, description, category, stock });
    });
});

app.delete("/products/:id", (req, res) => {
    db.query("DELETE FROM products WHERE id = ?", [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: "Delete failed" });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Product not found" });
        res.json({ message: "Product deleted" });
    });
});

app.listen(5000, () => console.log("Server running on http://localhost:5000"));
