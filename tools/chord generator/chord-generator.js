// tools/chord-generator/chord-generator.js

document.addEventListener('DOMContentLoaded', () => {
    // ── Data ────────────────────────────────────────────────────────────────
    const KEYS = ["C", "C#", "Db", "D", "D#", "Eb", "E", "F", "F#", "Gb", "G", "G#", "Ab", "A", "A#", "Bb", "B"];
    const MOODS = [
        "Happy",
        "Sad",
        "Chill",
        "Uplifting",
        "Aggressive",
        "Suspenseful",
        "Romantic",
        "Epic",
        "Dark",
        "Nostalgic"
    ];
    const GENRES = [
        "Indie Rock",
        "Classic Rock",
        "Alternative",
        "Synth Pop",
        "Electro Pop",
        "Bubblegum Pop",
        "Boom Bap",
        "Trap",
        "Lo-Fi Hip-Hop",
        "Conscious Hip-Hop",
        "Neo-Soul",
        "Contemporary R&B",
        "Funk",
        "Jazz Funk",
        "Smooth Jazz",
        "Bebop",
        "Fusion",
        "Ambient",
        "Synthwave",
        "Future Bass",
        "Drum & Bass",
        "Electronica"
    ];
    const PROGRESSIONS = [
        { p: "I–V–vi–IV", d: "Happy" },
        { p: "vi–IV–I–V", d: "Sad" },
        { p: "Imaj7–V–vi7–IVmaj7", d: "Chill" },
        { p: "I–ii–iii–IV", d: "Uplifting" },
        { p: "I5–♭III5–IV5–V5", d: "Aggressive" },
        { p: "vi–IV–ii–V", d: "Suspenseful" },
        { p: "Imaj7–vi7–ii7–V7", d: "Romantic" },
        { p: "I–V–vi–iii–IV–I–IV–V", d: "Epic" },
        { p: "i–VI–VII–V", d: "Dark" },
        { p: "I–vi–IV–V", d: "Nostalgic" }
    ];
    const CHORD_TYPES = ["Triad", "Seventh", "Diminished", "Augmented", "Suspended", "Extended", "Half-diminished", "Sixth", "Altered"];

    fillSelect('scale', SCALES);
    fillSelect('key', KEYS);
    fillSelect('mood', MOODS);
    fillSelect('genre', GENRES);
    fillSelect('prog', PROGRESSIONS, true);
    fillSelect('chordType', CHORD_TYPES);

    // ── Music theory constants ───────────────────────────────────────────────
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
    const ROMAN_TO_DEGREE = {
        I: 0, ii: 1, iii: 2, IV: 3, V: 4, vi: 5, vii: 6,
        i: 0, II: 1, III: 2, iv: 3, v: 4, VI: 5, VII: 6
    };
    const QUALITY_FORMULAS = {
        maj: [0, 4, 7],
        min: [0, 3, 7],
        dim: [0, 3, 6],
        aug: [0, 4, 8],
        sus2: [0, 2, 7],
        sus4: [0, 5, 7],
        maj7: [0, 4, 7, 11],
        dom7: [0, 4, 7, 10],
        min7: [0, 3, 7, 10],
        hdim7: [0, 3, 6, 10],
        dim7: [0, 3, 6, 9],
        "6": [0, 4, 7, 9],
        "m6": [0, 3, 7, 9],
        "9": [0, 4, 7, 10, 14],
        "11": [0, 4, 7, 10, 14, 17],
        "13": [0, 4, 7, 10, 14, 17, 21]
    };

    // ── Helpers ───────────────────────────────────────────────────────────────
    function fillSelect(id, arr, desc = false) {
        const sel = document.getElementById(id);
        sel.innerHTML = '<option value="">-- Random --</option>';
        arr.forEach(v => {
            if (desc) sel.append(new Option(`${v.p} — ${v.d}`, v.p));
            else sel.append(new Option(v, v));
        });
    }

    function getScaleNotes(root, scale) {
        const ints = INTERVALS[scale.toLowerCase()] || INTERVALS.major;
        const i0 = NOTES.indexOf(root);
        return ints.map(i => NOTES[(i0 + i) % 12]);
    }

    function buildChord(root, quality) {
        const idx = NOTES.indexOf(root);
        const formula = QUALITY_FORMULAS[quality];
        if (!formula) return [];
        return formula.map(i => NOTES[(idx + i) % 12]);
    }

    function parseNumeral(numeral, scaleType) {
        // numeral: e.g. "I", "ii7", "IVmaj7", "V7b9", "sus4", "iii+"
        // extract base roman and quality suffix
        const m = numeral.match(/^(sus2|sus4|[ivIV]+)(.*)$/);
        if (!m) return { degree: 0, quality: 'maj' };
        const base = m[1], suffix = m[2];
        const deg = ROMAN_TO_DEGREE[base] || 0;
        // determine quality
        let quality = 'maj';
        if (/maj7$/.test(suffix)) quality = 'maj7';
        else if (/7$/.test(suffix)) quality = 'dom7';
        else if (/min7$|m7$/.test(suffix)) quality = 'min7';
        else if (/dim7$/.test(suffix)) quality = 'dim7';
        else if (/Ø7$/.test(suffix)) quality = 'hdim7';
        else if (/maj$/.test(suffix)) quality = 'maj';
        else if (/m$|min$/.test(suffix)) quality = 'min';
        else if (suffix === 'dim' || /°$/.test(suffix)) quality = 'dim';
        else if (/aug$|\+$/.test(suffix)) quality = 'aug';
        else if (/sus2$/.test(suffix)) quality = 'sus2';
        else if (/sus4$/.test(suffix)) quality = 'sus4';
        else if (/6$/.test(suffix)) quality = suffix === 'm6' ? 'm6' : '6';
        else if (/9$/.test(suffix)) quality = '9';
        else if (/11$/.test(suffix)) quality = '11';
        else if (/13$/.test(suffix)) quality = '13';
        return { degree: deg, quality };
    }

    // ── Core generation ───────────────────────────────────────────────────────
    function generateChords({ scale, key, count, template, jazziness, chordType }) {
        const scaleNotes = getScaleNotes(key, scale);
        const used = {}, out = [];
        let colorIdx = 0;

        for (let i = 0; i < count; i++) {
            let numeral = template
                ? template.split('–').map(s => s.trim())[i % template.split('–').length]
                : null;

            if (!numeral) {
                // pick by chordType/jazziness
                if (chordType === 'Triad') {
                    const pool = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii'];
                    numeral = pool[Math.floor(Math.random() * pool.length)];
                } else if (chordType === 'Seventh') {
                    const pool = ['Imaj7', 'ii7', 'iii7', 'IVmaj7', 'V7', 'vi7', 'viiØ7'];
                    numeral = pool[Math.floor(Math.random() * pool.length)];
                } else {
                    // default: jazziness triad vs seventh
                    const use7 = Math.random() < jazziness / 100;
                    const pool = use7
                        ? ['Imaj7', 'ii7', 'iii7', 'IVmaj7', 'V7', 'vi7', 'viiØ7']
                        : ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii'];
                    numeral = pool[Math.floor(Math.random() * pool.length)];
                }
            }

            const { degree, quality } = parseNumeral(numeral, scale);
            const root = scaleNotes[degree] || key;
            const notes = buildChord(root, quality);
            const func = FUNCMAP[numeral.replace(/[^ivIV]/g, '')] || '';
            if (!(numeral in used)) used[numeral] = colorIdx++;
            const color = PALETTE[used[numeral] % PALETTE.length];

            out.push({
                numeral,
                chordName: root + (QUALITY_FORMULAS[quality][1] === 4 ? '' : ''),
                notes,
                function: func,
                color
            });
        }
        return out;
    }

    function renderChords(chords) {
        const strip = document.getElementById('chordStrip');
        strip.innerHTML = '';
        chords.forEach((c, i) => {
            const d = document.createElement('div');
            d.className = 'chord'; d.draggable = true; d.dataset.index = i;
            d.style.borderColor = c.color;
            d.innerHTML = `
        <div class="numeral">${c.numeral}</div>
        <div class="chord-name">${c.chordName}</div>
        <div class="notes">${c.notes.join(' ')}</div>
        <div class="chord-function">${c.function}</div>
      `;
            d.addEventListener('dragstart', e => e.dataTransfer.setData('text', i));
            d.addEventListener('dragover', e => e.preventDefault());
            d.addEventListener('drop', e => {
                const from = +e.dataTransfer.getData('text'), to = +d.dataset.index;
                [current[from], current[to]] = [current[to], current[from]];
                renderChords(current);
            });
            strip.appendChild(d);
        });
    }

    // ── UI setup ─────────────────────────────────────────────────────────────
    fillSelect('scale', SCALES);
    fillSelect('key', KEYS);
    fillSelect('mood', MOODS);
    fillSelect('genre', GENRES);
    fillSelect('prog', PROGRESSIONS, true);
    fillSelect('chordType', CHORD_TYPES);

    document.getElementById('advBtn').addEventListener('click', () => {
        document.getElementById('advPanel').classList.toggle('visible');
    });

    const cntS = document.getElementById('countSlider'),
        cntL = document.getElementById('countLabel'),
        jazS = document.getElementById('jazziness'),
        jazL = document.getElementById('jazzVal');
    cntS.oninput = () => cntL.innerText = cntS.value;
    jazS.oninput = () => jazL.innerText = jazS.value + '%';

    let current = [];
    document.getElementById('generateBtn').onclick = () => {
        function pick(sel, arr) {
            return sel.value || arr[Math.floor(Math.random() * arr.length)];
        }
        const cfg = {
            scale: pick(document.getElementById('scale'), SCALES),
            key: pick(document.getElementById('key'), KEYS),
            count: +cntS.value,
            template: document.getElementById('prog').value,
            jazziness: +jazS.value,
            chordType: document.getElementById('chordType').value
        };
        const m = document.getElementById('mood'),
            g = document.getElementById('genre');
        if (!m.value) m.value = pick(m, MOODS);
        if (!g.value) g.value = pick(g, GENRES);

        current = generateChords(cfg);
        renderChords(current);
    };

    document.getElementById('resetBtn').onclick = () => {
        ['scale', 'key', 'mood', 'genre', 'prog', 'chordType'].forEach(id =>
            document.getElementById(id).value = ''
        );
        cntS.value = 4; cntL.innerText = '4';
        jazS.value = 0; jazL.innerText = '0%';
        document.getElementById('advPanel').classList.remove('visible');
        current = []; document.getElementById('chordStrip').innerHTML = '';
    };

    document.getElementById('generateBtn').click();
});
