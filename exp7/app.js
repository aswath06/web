const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
let users = {};


wss.on("connection", ws => {
    ws.on("message", msg => {
        try {
            const data = JSON.parse(msg);
            if (data.type === "set_username") users[ws.username = data.username] = ws;
            else if (data.type === "message" && users[data.receiver])
                users[data.receiver].send(JSON.stringify({ type: "message", sender: data.sender, content: data.content }));
            sendUserList();
        } catch (err) { console.error("Error:", err); }
    });
    ws.on("close", () => { delete users[ws.username]; sendUserList(); });
});


const sendUserList = () => wss.clients.forEach(c =>
    c.readyState === WebSocket.OPEN && c.send(JSON.stringify({ type: "user_list", users: Object.keys(users) })));
app.use(express.static(path.join(__dirname, "../frontend")));
server.listen(5002, () => console.log("🚀 Server running on http://localhost:5002"));
