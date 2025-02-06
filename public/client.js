let mediaRecorder;
let audioChunks = [];
console.log("window.location.host", window.location.host);
const ws = new WebSocket(`ws://${window.location.host}`);

const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const characterInfo = document.getElementById('characterInfo');

const ROLE_STYLES = {
    'Moderator': {
        color: '#4CAF50',
        label: 'Moderator'
    },
    'Detective': {
        color: '#9C27B0',
        label: 'Detective'
    },
    'Mafia': {
        color: '#F44336',
        label: 'Mafia'
    },
    'Doctor': {
        color: '#2196F3',
        label: 'Doctor'
    },
    'Villager': {
        color: '#FF9800',
        label: 'Villager'
    },
    'PlaceHolder': {
        color: '#9E9E9E',
        label: 'Player (Unassigned)'
    }
};

// Add at the start with other constants
const dayTimeInfo = document.createElement('div');
dayTimeInfo.id = 'dayTimeInfo';
document.body.insertBefore(dayTimeInfo, document.body.firstChild);

const gameState = {
    time: 'DAY',
    started: false,
    playerCount: 0
};

startButton.onclick = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        
        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
            if (mediaRecorder.state === "inactive") {
                const blob = new Blob(audioChunks, { type: 'audio/webm' });
                ws.send(blob);
                audioChunks = [];
            }
        };

        mediaRecorder.start(250);
        startButton.disabled = true;
        stopButton.disabled = false;
    } catch (err) {
        console.error('Error accessing microphone:', err);
    }
};

stopButton.onclick = () => {
    mediaRecorder.stop();
    startButton.disabled = false;
    stopButton.disabled = true;
};

// Add action handling
const actionsList = document.createElement('div');
actionsList.className = 'actions-list';
document.body.appendChild(actionsList);

function showNamePrompt() {
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

function updateActions(actions) {
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

ws.onmessage = async (event) => {
    try {
        const data = JSON.parse(event.data);
        console.log(data);
        
        if (data.type === 'game_info') {
            // Update gameState
            Object.assign(gameState, data.data);
            
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
            return;
        }

        if (data.type === 'character_info') {
            const { character } = data;
            const style = ROLE_STYLES[character.type];
            
            characterInfo.style.borderLeftColor = style.color;
            characterInfo.innerHTML = `
                <strong style="color: ${style.color}">${style.label}</strong><br>
                ${character.name}
            `;

            // Update available actions
            if (character.actions) {
                updateActions(character.actions);
            }
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
        // If parsing fails, treat it as audio data
        const blob = event.data;
        const audio = new Audio(URL.createObjectURL(blob));
        await audio.play();
    }
};