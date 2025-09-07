const keys = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const bluesProgression = [1, 1, 1, 1, 4, 4, 1, 1, 5, 4, 1, 5]; // Roman numerals: I-IV-I-I-IV-IV-I-I-V-IV-I-V
const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

let intervalId;
let beat = 0;
let beatsPerMeasure = 4; // Default to 4/4
let measure = 0;
let audioContext = new (window.AudioContext || window.webkitAudioContext)();
let chords = [];

function getChord(key, numeral) {
    const scale = keys.indexOf(key);
    let interval = 0;
    if (numeral === 1) interval = 0;
    else if (numeral === 4) interval = 5;
    else if (numeral === 5) interval = 7;
    const root = (scale + interval) % 12;
    return keys[root];
}
function renderMetronome() {
    const metronome = document.getElementById('metronome');
    metronome.innerHTML = '';
    for (let i = 0; i < beatsPerMeasure; i++) {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        metronome.appendChild(dot);
    }
}

// Function to get chord name based on key and numeral
function renderGrid(key) {
    const grid = document.getElementById('chord-grid');
    grid.innerHTML = '';
    const displayMode = document.getElementById('display') ? document.getElementById('display').value : 'chord';
    chords = bluesProgression.map(num => getChord(key, num));
    bluesProgression.forEach((num, i) => {
        const div = document.createElement('div');
        div.classList.add('chord');
        if (displayMode === 'roman') {
            div.textContent = romanNumerals[num - 1];
        } else {
            div.textContent = chords[i];
        }
        if (i === measure) div.classList.add('active');
        grid.appendChild(div);
    });
    renderMetronome();
}

// Metronome tick
function tick() {
    const dots = document.querySelectorAll('.dot');
    dots.forEach(d => d.classList.remove('active'));
    if (dots[beat]) dots[beat].classList.add('active');
    
    if (document.getElementById('mode').value === 'visual-audio') {
        const oscillator = audioContext.createOscillator();
        oscillator.connect(audioContext.destination);
        oscillator.frequency.value = beat === 0 ? 880 : 440;
        oscillator.start();
        setTimeout(() => oscillator.stop(), 100);
    }
    
    if (beat === 0) {
        document.querySelectorAll('.chord').forEach(c => c.classList.remove('active'));
        document.querySelectorAll('.chord')[measure].classList.add('active');
    }
    
    beat = (beat + 1) % beatsPerMeasure;
    if (beat === 0) measure = (measure + 1) % 12;
}
// Add a countdown display element if not present
if (!document.getElementById('countdown')) {
    const countdownDiv = document.createElement('div');
    countdownDiv.id = 'countdown';
    countdownDiv.style.position = 'fixed';
    countdownDiv.style.top = '50%';
    countdownDiv.style.left = '50%';
    countdownDiv.style.transform = 'translate(-50%, -50%)';
    countdownDiv.style.fontSize = '4rem';
    countdownDiv.style.fontWeight = 'bold';
    countdownDiv.style.background = 'rgba(255,255,255,0.85)';
    countdownDiv.style.borderRadius = '20px';
    countdownDiv.style.padding = '40px 60px';
    countdownDiv.style.zIndex = '100';
    countdownDiv.style.display = 'none';
    document.body.appendChild(countdownDiv);
}

let countdownActive = false; // Track if countdown is running

function showCountdown(seconds, callback) {
    countdownActive = true;
    const startBtn = document.getElementById('start');
    startBtn.disabled = true;
    const countdownDiv = document.getElementById('countdown');
    countdownDiv.style.display = 'block';
    countdownDiv.textContent = seconds;
    let current = seconds;
    const countdownInterval = setInterval(() => {
        current--;
        if (current > 0) {
            countdownDiv.textContent = current;
        } else {
            clearInterval(countdownInterval);
            countdownDiv.style.display = 'none';
            countdownActive = false;
            startBtn.disabled = false;
            callback();
        }
    }, 1000);
}
// Event listeners
document.getElementById('key').addEventListener('change', e => renderGrid(e.target.value));
document.getElementById('signature').addEventListener('change', e => {
    beatsPerMeasure = parseInt(e.target.value, 10);
    renderMetronome();
});
// Add event listener for display mode
document.getElementById('display').addEventListener('change', () => {
    renderGrid(document.getElementById('key').value);
});
document.getElementById('start').addEventListener('click', () => {
    if (countdownActive) return; // Prevent multiple countdowns/metronomes
    const bpm = parseInt(document.getElementById('bpm').value);
    beatsPerMeasure = parseInt(document.getElementById('signature').value, 10);
    renderGrid(document.getElementById('key').value);
    clearInterval(intervalId);
    beat = 0;
    measure = 0;

    // Show countdown, then start metronome
    showCountdown(3, () => {
        tick(); // Call tick immediately so first beat is played
        intervalId = setInterval(tick, 60000 / bpm);
    });
});

document.getElementById('stop').addEventListener('click', () => {
    clearInterval(intervalId);
    // Hide countdown if visible and re-enable start button
    const countdownDiv = document.getElementById('countdown');
    if (countdownDiv) countdownDiv.style.display = 'none';
    countdownActive = false;
    document.getElementById('start').disabled = false;
});

// Initialize
keys.forEach(k => {
    const opt = document.createElement('option');
    opt.value = k;
    opt.textContent = k;
    document.getElementById('key').appendChild(opt);
});
beatsPerMeasure = parseInt(document.getElementById('signature').value, 10);
renderGrid('C');