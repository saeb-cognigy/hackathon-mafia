import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import path from 'path';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('New client connected');

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