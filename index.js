const startButton = document.getElementById('start');
const recordButton = document.getElementById('record');
const playButton = document.getElementById('play');
const downloadButton = document.getElementById('download');
const shareScreenButton = document.getElementById('share');
const snapshotButton = document.getElementById('snapshot');
const gumVideo = document.querySelector('video#gum');
const recordedVideo = document.querySelector('video#recorded');
const canvas = document.querySelector('canvas');
const filterSelect = document.querySelector('select#filter');

let mediaRecorder;
let recordedBlobs;

// share screen
shareScreenButton.addEventListener('click', shareScreen);

async function shareScreen(displayMediaOptions) {
    let captureStream = null;

    try {
        captureStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
    } catch (err) {
        console.error("Error: " + err);
    }
    return captureStream;
}

// download recorded stream
downloadButton.addEventListener('click', downloadStream);

function downloadStream() {
    const buffer = new Blob(recordedBlobs, { type: "video/webm" });
    recordedVideo.src = window.URL.createObjectURL(buffer);
    downloadButton.href = recordedVideo.src;
    downloadButton.download = "RecordedVideo.webm";
};

snapshotButton.addEventListener('click', () => {
    canvas.className = filterSelect.value;
    canvas.getContext('2d').drawImage(gumVideo, 0, 0, canvas.width, canvas.height);
})

// Play recorded stream
playButton.addEventListener('click', () => {
    const buffer = new Blob(recordedBlobs, { type: 'video/webm' });
    recordedVideo.src = window.URL.createObjectURL(buffer);
    recordedVideo.controls = true;
    recordedVideo.style.display = "block";
    recordedVideo.play();
})

const handleDataAvailable = (event) => {
    if (event.data) {
        recordedBlobs.push(event.data);
    }
}

const startRecording = () => {
    recordedBlobs = [];
    let options = {
        mimeType: 'video/webm; codecs=vp9, opus'
    }

    try {
        mediaRecorder = new MediaRecorder(window.stream, options);
    } catch (error) {
        console.error(error);
    }

    recordButton.textContent = 'Stop Recording';
    playButton.disabled = true;
    downloadButton.style.color = "rgb(207, 205, 205)"
    downloadButton.removeEventListener('click', downloadStream);
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.start();
}

const stopRecording = () => {
    recordButton.textContent = 'Record';
    playButton.disabled = false;
    downloadButton.style.color = "#000"
    downloadButton.addEventListener('click', downloadStream);
    mediaRecorder.stop();
}

// Record stream
recordButton.addEventListener('click', () => {
    if (recordButton.textContent === 'Record') {
        startRecording();
    } else {
        stopRecording();
    }
})

// Start stream
const handleSuccess = (stream) => {
    recordButton.disabled = false;
    snapshotButton.disabled = false;
    window.stream = stream;
    gumVideo.srcObject = stream;
}

const init = () => {
    const constraints = {
        video: {
            width: 1280,
            height: 720
        },
        audio: true
    }
    navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => handleSuccess(stream))
        .catch(error => console.error(error));
}

startButton.addEventListener('click', () => {
    if (startButton.innerText === 'Start camera') {
        startButton.innerText = 'Stop camera';
        init();
    } else {
        startButton.innerText = 'Start camera';
        recordButton.innerText = 'Record';
        recordButton.disabled = true;
        snapshotButton.disabled = true;
        playButton.disabled = true;
        downloadButton.style.color = "rgb(207, 205, 205)"
        downloadButton.removeEventListener('click', downloadStream);
        gumVideo.srcObject = null;
        window.stream = null;
        recordedVideo.style.display = 'none';
        recordedVideo.src = null;
    }
});



