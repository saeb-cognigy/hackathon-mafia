let mediaRecorder;
let audioChunks = [];
console.log("window.location.host", window.location.host);
const ws = new WebSocket(`ws://${window.location.host}`);

const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');

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

ws.onmessage = async (event) => {
    const blob = event.data;
    const audio = new Audio(URL.createObjectURL(blob));
    await audio.play();
};