const keys = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const bluesProgression = [1, 1, 1, 1, 4, 4, 1, 1, 5, 4, 1, 5]; // Roman numerals: I-IV-I-I-IV-IV-I-I-V-IV-I-V

let intervalId;
let beat = 0;
let measure = 0;
let audioContext = new (window.AudioContext || window.webkitAudioContext)();
let chords = [];

// Function to get chord name based on key and numeral
function getChord(key, numeral) {
    const scale = keys.indexOf(key);
    const root = (scale + [0, 0, 0, 0, 5, 5, 0, 0, 7, 5, 0, 7][numeral - 1]) % 12; // Simplified major chords
    return keys[root];
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
}

// Metronome tick
function tick() {
    const dots = document.querySelectorAll('.dot');
    dots.forEach(d => d.classList.remove('active'));
    dots[beat].classList.add('active');
    
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
    
    beat = (beat + 1) % 4;
    if (beat === 0) measure = (measure + 1) % 12;
}

// Event listeners
document.getElementById('key').addEventListener('change', e => renderGrid(e.target.value));
document.getElementById('start').addEventListener('click', () => {
    const bpm = parseInt(document.getElementById('bpm').value);
    renderGrid(document.getElementById('key').value);
    clearInterval(intervalId);
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
renderGrid('C');