import http from "http";
import WebSocket, { WebSocketServer } from "ws";
import express from "express";
import path from "path";
import url from "url";

const app = express();

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const sockets = [];

wss.on("connection", (socket) => {
    socket["nickname"] = "Anon";
    sockets.push(socket);
    console.log("Connected to Browser ✅");
    socket.on("close", () => { console.log("Disconnected form Browser ❌") });
    socket.on("message", (message) => {
        const parsed = JSON.parse(message);
        const type = parsed["type"];
        const payload = parsed["payload"];

        if (type === "new_message") {
            sockets.forEach((aSocket) => {
                if (aSocket.nickname !== socket.nickname) {
                    aSocket.send(`${socket.nickname}: ${payload}`);
                }else{
                    aSocket.send(`<p align=right>me: ${payload}</p>`);
                }
            });
            return;
        }

        if (type === "nickname") {
            console.log(payload);
            socket["nickname"] = payload;
            return;
        }
    });
    socket.send("hello");
});

server.listen(3000, handleListen);