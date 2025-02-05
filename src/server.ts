import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { Character } from './abstract';
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
const game = new Game();

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// WebSocket connection handling
wss.on('connection', (ws) => {
    let character: Character | null = null;
    // If this is the first client, make them moderator
    if (!game.hasModerator()) {
        try {
            character = game.createModerator();
            ws.send(JSON.stringify({
                type: 'character_info',
                character: {
                    id: character.getId(),
                    name: 'GameMaster',
                    type: 'Moderator'
                }
            }));
        } catch (error) {
            console.error('Failed to set moderator:', error);
        }
    } else {
        character = game.createPlaceholderCharacter();
        ws.send(JSON.stringify({
            type: 'character_info',
            character: {
                id: character.getId(),
                name: 'NewPlayer',
                type: 'Placeholder'
            }
        }));
        console.log(`Added client ${character?.getId()}`);
    }

    // Handle incoming messages
    ws.on('message', (data) => {
        // Check if it's a Blob (audio data)
        if (data instanceof Buffer) {
            // Broadcast the audio data to all other clients
            wss.clients.forEach((client) => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(data);
                }
            });
        }
    });

    ws.on('close', () => {
        if (character) {
            game.removeCharacter(character.getId());
            console.log('Client disconnected:', character.getId());
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});