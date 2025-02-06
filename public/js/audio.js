import { ws } from './websocket.js';
import { startButton, stopButton } from './ui.js';

let mediaRecorder;
let audioChunks = [];

export function initAudioControls() {
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
}

export function playAudio(blob) {
    const audio = new Audio(URL.createObjectURL(blob));
    audio.play();
} 