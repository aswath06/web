const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");
const mysql = require("mysql2");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = 5002;

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "A09.10.2005",
    database: "chat_app"
});

db.connect(err => {
    if (err) {
        console.error("MySQL connection failed:", err);
        process.exit(1);
    }
    console.log("Connected to MySQL");
});

let users = {};

wss.on("connection", ws => {
    ws.on("message", msg => {
        try {
            const data = JSON.parse(msg);

            if (data.type === "set_username") {
                ws.username = data.username;
                users[ws.username] = ws;
                db.query("INSERT IGNORE INTO users (username) VALUES (?)", [data.username]);

                sendUserList();
            }

            else if (data.type === "message" && users[data.receiver]) {
                const { sender, receiver, content } = data;
                db.query("INSERT INTO messages (sender, receiver, content) VALUES (?, ?, ?)",
                    [sender, receiver, content]);
                users[receiver].send(JSON.stringify({
                    type: "message",
                    sender,
                    content
                }));
            }

        } catch (err) {
            console.error("Error parsing message:", err);
        }
    });

    ws.on("close", () => {
        if (ws.username) {
            delete users[ws.username];
            sendUserList();
        }
    });
});

function sendUserList() {
    const userList = Object.keys(users);
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: "user_list", users: userList }));
        }
    });
}

app.use(express.static(path.join(__dirname, "../frontend")));

server.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
