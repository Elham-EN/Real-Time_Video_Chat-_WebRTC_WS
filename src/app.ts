/**
 * This part of the code sets up an HTTP server to serve static files and a WebSocket server
 * to handle real-time communication.
 * Explanation:
 *  * HTTP Server: Serves static files (HTML, CSS, JS) based on the request URL.
 *  * WebSocket Server: Manages WebSocket connections and broadcasts messages to
 *  * clients in a specified room.
 *  * UUID: Generates unique identifiers for each client connection.
 *  * Clients Array: Stores connected clients.
 */

import http from "http";
import fs from "fs";
import path from "path";
import WebSocket from "ws";
import { v4 as uuidv4 } from "uuid"; // Import UUID for unique identifiers

// Create an HTTP server
const server: http.Server = http.createServer(
  (req: http.IncomingMessage, res: http.ServerResponse) => {
    const url = req.url || "/";
    // Determine the file path based on the request URL
    let filePath = path.join(__dirname, "../public", url === "/" ? "index.html" : url);
    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      ".html": "text/html",
      ".js": "application/javascript",
      ".css": "text/css",
      ".json": "application/json",
      ".png": "image/png",
      ".jpg": "image/jpg",
      ".gif": "image/gif",
      ".wav": "audio/wav",
      ".mp4": "video/mp4",
      ".woff": "application/font-woff",
      ".ttf": "application/font-ttf",
      ".eot": "application/vnd.ms-fontobject",
      ".otf": "application/font-otf",
      ".svg": "application/image/svg+xml",
    };

    const contentType = mimeTypes[extname] || "application/octet-stream";

    // Read the file from the file system
    fs.readFile(filePath, (error, content) => {
      if (error) {
        if (error.code == "ENOENT") {
          res.writeHead(404, { "Content-Type": "text/plain" });
          res.end("404 Not Found", "utf-8");
        } else {
          res.writeHead(500);
          res.end("Sorry, check with the site admin for error: " + error.code + " ..\n");
        }
      } else {
        res.writeHead(200, { "Content-Type": contentType });
        res.end(content, "utf-8");
      }
    });
  }
);

// Create a WebSocket server and attach it to the HTTP server
const wss: WebSocket.Server = new WebSocket.Server({ server });

interface Client {
  id: string;
  ws: WebSocket;
  room?: string;
}

const clients: Client[] = [];
// Handle WebSocket connections
wss.on("connection", (ws: WebSocket) => {
  const client: Client = { id: uuidv4(), ws };
  clients.push(client);
  console.log("WebSocket connection established with ID:", client.id);

  ws.on("message", (message: WebSocket.Data) => {
    const data = JSON.parse(message.toString());
    console.log("Received message:", data);

    switch (data.type) {
      case "join":
        client.room = data.room;
        console.log(`Client ${client.id} joined room: ${data.room}`);
        break;
      case "offer":
      case "answer":
      case "candidate":
      case "chat":
      case "file":
      case "end":
        data.senderId = client.id;
        broadcast(data, client.room, ws);
        break;
    }
  });

  ws.on("close", () => {
    clients.splice(clients.indexOf(client), 1);
    console.log("WebSocket connection closed for ID:", client.id);
  });
});

/**
 * Broadcasts a message to all clients in a specified room except the sender.
 *
 * @param message - The message to broadcast.
 * @param room - The room to which the message should be broadcasted.
 * @param sender - The WebSocket connection of the sender.
 */
function broadcast(message: any, room: string | undefined, sender: WebSocket) {
  clients.forEach((client) => {
    if (
      client.room === room &&
      client.ws !== sender &&
      client.ws.readyState === WebSocket.OPEN
    ) {
      client.ws.send(JSON.stringify(message));
    }
  });
}

// Start the HTTP server on port 3000
server.listen(3000, () => {
  console.log("Server running on port 3000");
});
