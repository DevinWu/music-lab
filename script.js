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

let currentMode = 'simultaneous';
let lastNoteTime = null; // 记录上一个音符的时间戳
let sequenceStartTime = null; // 记录序列开始的时间

document.getElementById('mode-select').addEventListener('change', (event) => {
    currentMode = event.target.value;
    const sequenceDisplay = document.getElementById('sequence-display');
    
    // 清空所有选中的音符
    document.querySelectorAll('#note-selector input').forEach(noteInput => {
        noteInput.checked = false;
    });

    if (currentMode === 'sequential') {
        sequenceDisplay.style.display = 'block';
    } else {
        sequenceDisplay.style.display = 'none';
        sequenceDisplay.value = ''; // 清空文本框内容
    }
    lastNoteTime = null; // 重置时间戳
    sequenceStartTime = null; // 重置序列开始时间
});

document.querySelectorAll('#note-selector input').forEach(noteInput => {
    noteInput.addEventListener('change', () => {
        const synth = new Tone.Synth().toDestination();
        if (currentMode === 'no-memory') {
            if (noteInput.checked) {
                synth.triggerAttackRelease(noteInput.value, '8n');
                noteInput.checked = false; // Uncheck immediately
            }
        } else if (currentMode === 'sequential') {
            if (noteInput.checked) {
                synth.triggerAttackRelease(noteInput.value, '8n');
                const sequenceDisplay = document.getElementById('sequence-display');
                const currentTime = Date.now();
                
                if (sequenceStartTime === null) {
                    sequenceStartTime = currentTime; // 记录序列开始时间
                }

                if (lastNoteTime !== null) {
                    const interval = Math.round((currentTime - lastNoteTime) / 100); // 以0.1秒为单位
                    sequenceDisplay.value += ` ${interval}`;
                }
                
                sequenceDisplay.value += (sequenceDisplay.value ? ' ' : '') + noteInput.value;
                lastNoteTime = currentTime; // 更新上一个音符的时间戳
                noteInput.checked = false; // Uncheck immediately
            }
        }
    });
});

document.getElementById('play-button').addEventListener('click', async () => {
    await Tone.start(); // 确保音频上下文已启动
    const synth = new Tone.PolySynth(Tone.Synth).toDestination();
    const now = Tone.now();

    if (currentMode === 'simultaneous') {
        const selectedNotes = Array.from(document.querySelectorAll('#note-selector input:checked'))
            .map(input => input.value);

        if (selectedNotes.length > 0) {
            synth.triggerAttackRelease(selectedNotes, '8n', now);
        } else {
            alert('请选择至少一个音符或和弦！');
        }
    } else if (currentMode === 'sequential') {
        const sequenceDisplay = document.getElementById('sequence-display');
        const elements = sequenceDisplay.value.split(' ').filter(el => el);

        let timeOffset = 0;
        elements.forEach((el, index) => {
            if (isNaN(el)) {
                synth.triggerAttackRelease(el, '8n', now + timeOffset);
            } else {
                timeOffset += parseInt(el) * 0.1; // 将间隔转换为秒
            }
        });
    }
});

document.getElementById('clear-button').addEventListener('click', () => {
    // 清除所有选中的音符
    document.querySelectorAll('#note-selector input').forEach(noteInput => {
        noteInput.checked = false;
    });

    // 清除所有选中的和弦
    document.querySelectorAll('#chord-selector input, #four-note-chord-selector input').forEach(chordInput => {
        chordInput.checked = false;
    });

    // 清空音符序列显示框
    document.getElementById('sequence-display').value = '';
    sequenceStartTime = null; // 重置序列开始时间
}); 