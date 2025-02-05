import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import crypto from 'crypto';
import { Game } from './game';

// Extend WebSocket type to include our custom id property
declare module 'ws' {
    interface WebSocket {
        id: string;
    }
}

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Initialize game instance
const game = new Game({
    id: 'admin',
    name: 'GameMaster'
});

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// WebSocket connection handling
wss.on('connection', (ws) => {
  // Add a unique ID to the WebSocket client
  const NEW_ID = crypto.randomUUID(); // Using Node's crypto module for UUID generation

  // Handle incoming messages
  ws.on('message', (data) => {
    // Broadcast the audio data to all other clients
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});