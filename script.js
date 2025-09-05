const keys = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const bluesProgression = [1, 1, 1, 1, 4, 4, 1, 1, 5, 4, 1, 5]; // Roman numerals: I-IV-I-I-IV-IV-I-I-V-IV-I-V

let intervalId;
let beat = 0;
let beatsPerMeasure = 4; // Default to 4/4
let measure = 0;
let audioContext = new (window.AudioContext || window.webkitAudioContext)();
let chords = [];

// Function to get chord name based on key and numeral

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
// Render grid
function renderGrid(key) {
    const grid = document.getElementById('chord-grid');
    grid.innerHTML = '';
    chords = bluesProgression.map(num => getChord(key, num));
    chords.forEach((chord, i) => {
        const div = document.createElement('div');
        div.classList.add('chord');
        div.textContent = chord;
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

// Event listeners
document.getElementById('key').addEventListener('change', e => renderGrid(e.target.value));
document.getElementById('signature').addEventListener('change', e => {
    beatsPerMeasure = parseInt(e.target.value, 10);
    renderMetronome();
});
document.getElementById('start').addEventListener('click', () => {
    const bpm = parseInt(document.getElementById('bpm').value);
    beatsPerMeasure = parseInt(document.getElementById('signature').value, 10);
    renderGrid(document.getElementById('key').value);
    clearInterval(intervalId);
    beat = 0;
    measure = 0;
    tick(); // Call tick immediately so first beat is played
    intervalId = setInterval(tick, 60000 / bpm);
});
document.getElementById('stop').addEventListener('click', () => clearInterval(intervalId));

// Initialize
keys.forEach(k => {
    const opt = document.createElement('option');
    opt.value = k;
    opt.textContent = k;
    document.getElementById('key').appendChild(opt);
});
beatsPerMeasure = parseInt(document.getElementById('signature').value, 10);
renderGrid('C');