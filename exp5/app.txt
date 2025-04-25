const express = require("express"), app = express(), PORT = 3000, cors = require("cors");
app.use(cors(), express.json());
let tasks = [];

app.route("/tasks")
    .get((req, res) => res.json(tasks))
    .post((req, res) => {
        const { title, description } = req.body;
        if (!title) return res.status(400).json({ error: "Task title is required" });
        const newTask = { id: Date.now(), title, description, completed: false };
        tasks.push(newTask);
        res.json(newTask);
    });

app.put("/tasks/:id/complete", (req, res) => {
    const task = tasks.find(t => t.id == req.params.id);
    task ? (task.completed = true, res.json({ message: "Task completed" })) : res.status(404).json({ error: "Task not found" });
});

app.delete("/tasks/:id", (req, res) => {
    tasks = tasks.filter(t => t.id != req.params.id);
    res.json({ message: "Task deleted" });
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
