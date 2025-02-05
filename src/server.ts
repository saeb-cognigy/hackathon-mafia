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
        } catch (error) {
            console.error('Failed to set moderator:', error);
        }
    } else {
        character = game.createPlaceholderCharacter();
        ws.id = character.getId();
        console.log(character.toJSON());
        console.log(`Added client ${character?.getId()}`);
    }

    updateAll(game, wss);

    // Handle incoming messages
    ws.on('message', (data) => {
        try {
            // Try to parse as JSON first
            const message = JSON.parse(data.toString());
            
            if (message.type === 'action_request') {
                handleActionRequest(message, character, game, ws);
            }
            updateAll(game, wss);

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
        action.execute();
        
        // Update all clients with their new character info

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

function updateAll(game: Game, wss: WebSocketServer) {
    wss.clients.forEach(client => {
        const ws = client as WebSocket & { id: string };
        sendGameInfo(game, ws);
        const clientChar = game.getCharacters().find(c => c.getId() === ws.id);
        console.log("Updating client:", ws.id, "with character:", clientChar?.getId());
        if (clientChar) {
            client.send(clientChar.toJSON());
        }
    });
}

function sendGameInfo(game: Game, ws: WebSocket) {
    const gameInfo = JSON.stringify({
        type: 'game_info',
        data: {
            time: game.getDayTime(),
            started: game.isGameStarted(),
            playerCount: game.getCharactersCount()
        }
    });

    ws.send(gameInfo);
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});