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

    // 清空所有选中的和弦
    document.querySelectorAll('#chord-selector input, #four-note-chord-selector input').forEach(chordInput => {
        chordInput.checked = false;
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
                const sequenceDisplay = document.getElementById('sequence-display');
                const currentTime = Date.now();
                
                if (sequenceStartTime === null) {
                    sequenceStartTime = currentTime; // 记录序列开始时间
                }

                if (lastNoteTime !== null) {
                    const interval = Math.round((currentTime - lastNoteTime) / 100); // 以0.1秒为单位
                    sequenceDisplay.innerHTML += ` ${interval}`;
                }
                
                sequenceDisplay.innerHTML += (sequenceDisplay.innerHTML ? ' ' : '') + noteInput.value;
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
        const elements = sequenceDisplay.textContent.split(' ').filter(el => el);

        let timeOffset = 0;
        elements.forEach((el, index) => {
            if (isNaN(el)) {
                setTimeout(() => {
                    synth.triggerAttackRelease(el, '8n');
                    highlightNoteInSequence(el, index); // 高亮显示正在弹奏的音符
                }, timeOffset * 1000);
            } else {
                timeOffset += parseInt(el) * 0.1; // 将间隔转换为秒
            }
        });
    }
});

function highlightNoteInSequence(note, index) {
    const sequenceDisplay = document.getElementById('sequence-display');
    const elements = sequenceDisplay.textContent.split(' ').filter(el => el);
    elements[index] = `<span class="highlight-sequence">${note}</span>`;
    sequenceDisplay.innerHTML = elements.join(' ');
}

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

    // 重置时间戳和序列开始时间
    lastNoteTime = null;
    sequenceStartTime = null;
});

document.querySelectorAll('#chord-selector input, #four-note-chord-selector input').forEach(chordInput => {
    chordInput.addEventListener('change', () => {
        if (currentMode === 'sequential' && chordInput.checked) {
            const synth = new Tone.Synth().toDestination();
            const sequenceDisplay = document.getElementById('sequence-display');
            const selectedChord = chordInput.value;
            const notes = chordMap[selectedChord];

            if (notes) {
                // 在和弦开始前添加10个单位的间隔
                if (sequenceDisplay.innerHTML) {
                    sequenceDisplay.innerHTML += ' 10';
                }

                notes.forEach((note, index) => {
                    const interval = index === 0 ? '' : ' 8'; // 每个音符间隔8个单位的0.1秒
                    sequenceDisplay.innerHTML += `${interval} ${note}`;
                    synth.triggerAttackRelease(note, '8n', Tone.now() + index * 0.8); // 播放音符
                });
            }
        }
    });
}); 