"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const net_1 = __importDefault(require("net"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = __importDefault(require("http"));
const ws_1 = require("ws");
// configures dotenv to work in your application
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
app.get("/", (request, response) => {
    response.status(200).send("Hello World");
});
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    const wss = new ws_1.Server({ server });
    wss.on('connection', (client, req) => {
        const target = net_1.default.createConnection(5900, "192.168.1.143", () => {
            console.log("Connected to the target");
        });
        target.on("data", (data) => {
            //console.log("sending message: " + data);
            try {
                client.send(data);
            }
            catch (error) {
                target.end();
            }
        });
        target.on('end', () => {
            console.log('target disconnected');
            client.close();
        });
        target.on('error', () => {
            console.log('target connection error');
            target.end();
            client.close();
        });
        client.on('message', (message) => {
            target.write(message);
        });
        client.on('close', (code, reason) => {
            target.end();
        });
        client.on('error', (a) => {
            target.end();
        });
    });
});
