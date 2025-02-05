import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { Character } from './abstract';
import { Game } from './game';
import { ExtWebSocket } from './types';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Initialize game instance
const game = new Game();

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

interface ActionRequest {
    type: 'action_request';
    action: string;
}

// WebSocket connection handling
wss.on('connection', (ws: ExtWebSocket) => {
    let character: Character | null = null;
    // If this is the first client, make them moderator
    if (!game.hasModerator()) {
        try {
            character = game.createModerator();
            ws.id = character.getId();
            ws.send(character.toJSON());
        } catch (error) {
            console.error('Failed to set moderator:', error);
        }
    } else {
        character = game.createPlaceholderCharacter();
        ws.id = character.getId();
        console.log(character.toJSON());
        ws.send(character.toJSON());
        console.log(`Added client ${character?.getId()}`);
    }

    // Handle incoming messages
    ws.on('message', (data) => {
        try {
            // Try to parse as JSON first
            const message = JSON.parse(data.toString());
            
            if (message.type === 'action_request') {
                handleActionRequest(message, character, game, ws);
                return;
            }
        } catch (e) {
            console.error('Error parsing message:', e);
            // If parsing fails, treat as audio data
            if (data instanceof Buffer) {
                // Broadcast the audio data to all other clients
                wss.clients.forEach((client) => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(data);
                    }
                });
            }
        }
    });

    ws.on('close', () => {
        if (character) {
            game.removeCharacter(character.getId());
            console.log('Client disconnected:', character.getId());
        }
    });
});

function handleActionRequest(request: ActionRequest, character: Character | null, game: Game, ws: ExtWebSocket) {
    if (!character) {
        ws.send(JSON.stringify({
            type: 'action_response',
            success: false,
            message: 'No character associated with this connection'
        }));
        return;
    }

    const action = character.getActions().find(a => a['name'] === request.action);
    if (!action) {
        ws.send(JSON.stringify({
            type: 'action_response',
            success: false,
            message: 'Action not found or not allowed'
        }));
        return;
    }

    try {
        action.execute(game, character);
        
        // Send updated character info to all clients
        wss.clients.forEach(client => {
            const ws = client as WebSocket & { id: string };
            const clientChar = game.getCharacters().find(c => c.getId() === ws.id);
            console.log("clientChar", clientChar?.toJSON());
            if (clientChar) {
                client.send(clientChar.toJSON());
            }
        });

        ws.send(JSON.stringify({
            type: 'action_response',
            success: true,
            message: `Successfully executed ${request.action}`
        }));

    } catch (error) {
        ws.send(JSON.stringify({
            type: 'action_response',
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error occurred'
        }));
    }
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});