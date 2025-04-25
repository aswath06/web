const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "task_manager"
});

db.connect(err => {
    if (err) {
        console.error("MySQL connection error:", err);
        process.exit(1);
    }
    console.log("Connected to MySQL!");
});

app.get("/tasks", (req, res) => {
    db.query("SELECT * FROM tasks", (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json(results);
    });
});

app.post("/tasks", (req, res) => {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ error: "Task title is required" });

    const newTask = { id: Date.now(), title, description, completed: false };
    db.query("INSERT INTO tasks SET ?", newTask, (err, result) => {
        if (err) return res.status(500).json({ error: "Insert failed" });
        res.json(newTask);
    });
});

app.put("/tasks/:id/complete", (req, res) => {
    db.query("UPDATE tasks SET completed = true WHERE id = ?", [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: "Update failed" });
        if (result.affectedRows === 0) return res.status(404).json({ error: "Task not found" });
        res.json({ message: "Task completed" });
    });
});

app.delete("/tasks/:id", (req, res) => {
    db.query("DELETE FROM tasks WHERE id = ?", [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: "Delete failed" });
        res.json({ message: "Task deleted" });
    });
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
