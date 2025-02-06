import { gameState, ROLE_STYLES } from './constants.js';
import { ws } from './websocket.js';

export const startButton = document.getElementById('startButton');
export const stopButton = document.getElementById('stopButton');
export const characterInfo = document.getElementById('characterInfo');
export const actionsList = document.createElement('div');
export const dayTimeInfo = document.createElement('div');

// Initialize UI elements
actionsList.className = 'actions-list';
dayTimeInfo.id = 'dayTimeInfo';
document.body.insertBefore(dayTimeInfo, document.body.firstChild);
document.body.appendChild(actionsList);

export function showNamePrompt() {
    const newName = prompt("Enter your new name:", "");
    if (newName !== null && newName.trim() !== "") {
        ws.send(JSON.stringify({
            type: 'action_request',
            action: 'Update Name',
            input: {
                name: newName.trim()
            }
        }));
    }
}

export function updateActions(actions) {
    actionsList.innerHTML = '';
    
    const callableActions = actions.filter(action => action.is_callable);
    const isModerator = characterInfo.querySelector('strong').textContent === 'Moderator';
    
    if (callableActions.length === 0) {
        const message = document.createElement('div');
        message.className = 'waiting-message';
        
        if (isModerator) {
            message.textContent = gameState.started ? 
                'Waiting for other players to finish their turn' : 
                'Waiting for more players to join';
        } else {
            message.textContent = 'Please wait for your turn';
        }
        
        actionsList.appendChild(message);
        return;
    }

    callableActions.forEach(action => {
        const button = document.createElement('button');
        button.textContent = action.name;
        button.title = action.description;
        
        if (!action.required) {
            button.classList.add('optional-action');
        }
        
        if (action.name === 'Update Name') {
            button.onclick = showNamePrompt;
        } else {
            button.onclick = () => {
                ws.send(JSON.stringify({
                    type: 'action_request',
                    action: action.name
                }));
            };
        }
        
        actionsList.appendChild(button);
    });
}

export function updateGameInfo() {
    const timeStyle = gameState.time === 'DAY'            
        ? { color: '#FFD700', icon: '🌞' }
        : { color: '#4A4A9E', icon: '🌙' };
    
    dayTimeInfo.style.borderLeftColor = timeStyle.color;
    dayTimeInfo.innerHTML = `
        <span style="color: ${timeStyle.color}">
            ${timeStyle.icon} ${gameState.time}
        </span>
        <div class="game-stats">
            ${gameState.started ? '🎮 Game in progress' : '⏳ Waiting to start'}<br>
            👥 Players: ${gameState.playerCount}
        </div>
    `;
}

export function updateCharacterInfo(character) {
    const style = ROLE_STYLES[character.type];
    
    characterInfo.style.borderLeftColor = style.color;
    characterInfo.innerHTML = `
        <strong style="color: ${style.color}">${style.label}</strong><br>
        ${character.name}
    `;

    if (character.actions) {
        updateActions(character.actions);
    }
} 