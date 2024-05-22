import express, { Request, Response } from "express";
import net from "net"
import dotenv from "dotenv";
import http from "http"
import { Server as WebSocketServer } from 'ws';

// configures dotenv to work in your application
dotenv.config();
const app = express();
const server = http.createServer(app);

app.get("/", (request: Request, response: Response) => {
  response.status(200).send("Hello World");
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {

  console.log(`Server running on port ${PORT}`);

  const wss = new WebSocketServer({ server });

  wss.on('connection', (client, req) => {

    const target = net.createConnection(5900, "192.168.1.143", () => {
      console.log("Connected to the target");
    })

    target.on("data", (data) => {
      try {
        client.send(data);
      } catch (error) {
        target.end()
      }
    })
    target.on('end', () => {
      console.log('target disconnected')
      client.close()
    });
    target.on('error', () => {
      console.log('target connection error')
      target.end()
      client.close()
    });
    client.on('message', (message: string) => {
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

