import { gameState } from './constants.js';
import { updateGameInfo, updateCharacterInfo } from './ui.js';
import { playAudio } from './audio.js';

export const ws = new WebSocket(`ws://${window.location.host}`);

ws.onmessage = async (event) => {
    try {
        const data = JSON.parse(event.data);
        console.log(data);
        
        if (data.type === 'game_info') {
            Object.assign(gameState, data.data);
            updateGameInfo();
            return;
        }

        if (data.type === 'character_info') {
            updateCharacterInfo(data.character);
            return;
        }

        if (data.type === 'action_response') {
            console.log(data.message);
            if (data.success) {
                alert(data.message);
            } else {
                alert('Error: ' + data.message);
            }
            return;
        }
    } catch (e) {
        console.error("Error parsing message", e);
        const blob = event.data;
        await playAudio(blob);
    }
}; 