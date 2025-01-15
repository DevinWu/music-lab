const chordMap = {
    'C': ['C4', 'E4', 'G4'],
    'Am': ['A4', 'C4', 'E4'],
    'G': ['G4', 'B4', 'D4'],
    'F': ['F4', 'A4', 'C5'],
    'Dm': ['D4', 'F4', 'A4'],
    'Em': ['E4', 'G4', 'B4'],
    'A': ['A4', 'C#4', 'E4'],
    'C7': ['C4', 'E4', 'G4', 'Bb4'],
    'Am7': ['A4', 'C4', 'E4', 'G4'],
    'G7': ['G4', 'B4', 'D4', 'F4'],
    'Fmaj7': ['F4', 'A4', 'C5', 'E5'],
    'Dm7': ['D4', 'F4', 'A4', 'C5'],
    'E7': ['E4', 'G#4', 'B4', 'D5']
    // Add more chords as needed
};

function updateNoteSelection(chordType, selector) {
    document.querySelectorAll(selector).forEach(chordInput => {
        chordInput.addEventListener('change', () => {
            const selectedChord = chordInput.value;
            const notes = chordMap[selectedChord];

            // Uncheck all notes first
            document.querySelectorAll('#note-selector input').forEach(noteInput => {
                noteInput.checked = false;
            });

            // Check the notes in the selected chord
            notes.forEach(note => {
                const noteInput = document.querySelector(`#note-selector input[value="${note}"]`);
                if (noteInput) {
                    noteInput.checked = true;
                }
            });
        });
    });
}

updateNoteSelection('chord', '#chord-selector input');
updateNoteSelection('four-note-chord', '#four-note-chord-selector input');

// Add event listeners to play note when checked
document.querySelectorAll('#note-selector input').forEach(noteInput => {
    noteInput.addEventListener('change', () => {
        if (noteInput.checked) {
            const synth = new Tone.Synth().toDestination();
            synth.triggerAttackRelease(noteInput.value, '8n');
        }
    });
});

document.getElementById('play-button').addEventListener('click', () => {
    const selectedNotes = Array.from(document.querySelectorAll('#note-selector input:checked'))
        .map(input => input.value);

    if (selectedNotes.length > 0) {
        const synth = new Tone.PolySynth(Tone.Synth).toDestination();
        const now = Tone.now();

        // Simultaneously trigger all selected notes
        synth.triggerAttackRelease(selectedNotes, '8n', now);
    } else {
        alert('请选择至少一个音符或和弦！');
    }
});

document.getElementById('clear-button').addEventListener('click', () => {
    document.querySelectorAll('#note-selector input').forEach(noteInput => {
        noteInput.checked = false;
    });
}); 