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

function updateActions(actions) {
    actionsList.innerHTML = '';
    actions.forEach(action => {
        const button = document.createElement('button');
        button.textContent = action.name;
        button.title = action.description;
        button.onclick = () => {
            ws.send(JSON.stringify({
                type: 'action_request',
                action: action.name
            }));
        };
        actionsList.appendChild(button);
    });
}

ws.onmessage = async (event) => {
    try {
        const data = JSON.parse(event.data);
        console.log(data);
        
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