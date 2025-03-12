const octaves = [1, 2, 3, 4, 5, 6, 7];
const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const startMidi = 24;

export const WHITE_PIANO_NOTES = octaves.flatMap(o => notes.map(n => `${n}${o}`));

function* pianoNotes() {
    for(const note of WHITE_PIANO_NOTES) {
        yield note;
        const n = note[0];
        if (n !== 'E' && n !== 'B') {
            yield toDiezNote(note);
        }
    }
}

export const PIANO_NOTES = [...pianoNotes()];

export function midiToNote(midi: number) {
    return PIANO_NOTES[midi - startMidi];
}

export function toDiezNote(note: string) {
    const n = note[0];
    const o = note[1];
    return `${n}#${o}`;
}