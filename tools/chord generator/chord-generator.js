const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const INTERVALS = {
    major: [0, 2, 4, 5, 7, 9, 11],
    minor: [0, 2, 3, 5, 7, 8, 10],
    dorian: [0, 2, 3, 5, 7, 9, 10],
    phrygian: [0, 1, 3, 5, 7, 8, 10],
    lydian: [0, 2, 4, 6, 7, 9, 11],
    mixolydian: [0, 2, 4, 5, 7, 9, 10],
    "harmonic minor": [0, 2, 3, 5, 7, 8, 11],
    "melodic minor": [0, 2, 3, 5, 7, 9, 11],
    pentatonic: [0, 2, 4, 7, 9],
    blues: [0, 3, 5, 6, 7, 10]
};

let currentChords = [];

function loadData(id, path, labelKey, valueKey) {
    fetch(path)
        .then(res => res.json())
        .then(data => {
            const sel = document.getElementById(id);
            sel.innerHTML = '';
            if (Array.isArray(data)) {
                data.forEach(item => {
                    const o = new Option(item, item);
                    sel.appendChild(o);
                });
            } else {
                data.forEach(obj => {
                    const o = new Option(`${obj[labelKey]} — ${obj[valueKey]}`, obj[labelKey]);
                    sel.appendChild(o);
                });
            }
        });
}

function getScaleNotes(root, scaleType) {
    const ints = INTERVALS[scaleType.toLowerCase()] || INTERVALS.major;
    const rootIndex = NOTES.indexOf(root);
    return ints.map(i => NOTES[(rootIndex + i) % 12]);
}

function generateChords({ key, scale, count, template }) {
    const notes = getScaleNotes(key, scale);
    const numerals = template ? template.split('–') : Array.from({ length: count }, () => {
        const roman = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii'];
        return roman[Math.floor(Math.random() * roman.length)];
    });
    return numerals.slice(0, count).map((n, i) => {
        const degree = "I ii iii IV V vi vii".split(' ').indexOf(n.replace(/[maj7|min7|7|Ø7]/, ''));
        const root = notes[degree] || key;
        const chordName = root + (n.includes("7") ? "7" : "");
        return { numeral: n, chordName, notes: buildTriad(root), number: i + 1 };
    });
}

function buildTriad(root) {
    const rootIndex = NOTES.indexOf(root);
    return [0, 4, 7].map(i => NOTES[(rootIndex + i) % 12]);
}

function renderChords(chords) {
    const strip = document.getElementById('chordStrip');
    strip.innerHTML = '';
    chords.forEach((c, i) => {
        const d = document.createElement('div');
        d.className = 'chord';
        d.innerHTML = `
      <div class="number">${c.number}</div>
      <div class="numeral">${c.numeral}</div>
      <div class="name">${c.chordName}</div>
      <div class="notes">${c.notes.join(' ')}</div>
    `;
        strip.appendChild(d);
    });
}

document.getElementById('countSlider').oninput = e =>
    document.getElementById('countLabel').innerText = e.target.value;

document.getElementById('generateBtn').onclick = () => {
    const key = document.getElementById('key').value;
    const scale = document.getElementById('scale').value;
    const prog = document.getElementById('prog').value;
    const count = parseInt(document.getElementById('countSlider').value);
    currentChords = generateChords({ key, scale, count, template: prog });
    renderChords(currentChords);
};

document.getElementById('resetBtn').onclick = () => {
    document.getElementById('chordStrip').innerHTML = '';
};

document.getElementById('exportBtn').onclick = () => {
    exportToMIDI(currentChords);
};

loadData('mood', '../../data/moods.json');
loadData('genre', '../../data/genres.json');
loadData('scale', '../../data/scales.json');
loadData('prog', '../../data/progressions.json', 'progression', 'description');