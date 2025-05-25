function exportToMIDI(chords) {
  const header = new Uint8Array([
    0x4d, 0x54, 0x68, 0x64, // MThd
    0x00, 0x00, 0x00, 0x06, // header length
    0x00, 0x00,             // format type
    0x00, 0x01,             // number of tracks
    0x00, 0x60              // time division (96 ticks per quarter note)
  ]);

  let track = [
    0x4d, 0x54, 0x72, 0x6b, // MTrk
    0x00, 0x00, 0x00, 0x00  // placeholder for track length
  ];

  const tempo = [0x00, 0xFF, 0x51, 0x03, 0x07, 0xA1, 0x20]; // 120 BPM
  const start = [0x00, 0xC0, 0x00]; // Program change (instrument)
  track = track.concat(tempo, start);

  let time = 0;
  const ticksPerChord = 96 * 2;

  for (let i = 0; i < chords.length; i++) {
    const chord = chords[i];
    chord.notes.forEach(note => {
      const midi = noteToMidi(note);
      track.push(0x00, 0x90, midi, 0x60); // Note on
    });
    time += ticksPerChord;
    chord.notes.forEach(note => {
      const midi = noteToMidi(note);
      track.push(...varLen(time), 0x80, midi, 0x40); // Note off
      time = 0;
    });
  }

  // End of track
  track.push(0x00, 0xFF, 0x2F, 0x00);

  // Write track length
  const len = track.length - 8;
  track[4] = (len >> 24) & 0xFF;
  track[5] = (len >> 16) & 0xFF;
  track[6] = (len >> 8) & 0xFF;
  track[7] = len & 0xFF;

  const full = new Uint8Array(header.length + track.length);
  full.set(header, 0);
  full.set(track, header.length);

  const blob = new Blob([full], { type: 'audio/midi' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'chords.mid';
  a.click();
  URL.revokeObjectURL(url);
}

function noteToMidi(note) {
  const map = { 'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11 };
  return 60 + (map[note] ?? 0); // Middle C + offset
}

function varLen(value) {
  const buffer = [];
  let v = value & 0x7F;
  while (value >>= 7) {
    v <<= 8;
    v |= ((value & 0x7F) | 0x80);
  }
  while (true) {
    buffer.push(v & 0xFF);
    if (v & 0x80) v >>= 8;
    else break;
  }
  return buffer;
}
