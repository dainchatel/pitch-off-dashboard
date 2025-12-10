// Global audio state
let audioElements = {};
let currentlyPlaying = null;
let customAudioFiles = [];

// Default audio stings (examples - these would be replaced with actual files)
const defaultStings = [
    { id: 'intro', name: 'Intro Sting', description: 'Opening theme', file: null },
    { id: 'transition', name: 'Transition', description: 'Segment transition', file: null },
    { id: 'outro', name: 'Outro Sting', description: 'Closing theme', file: null },
    { id: 'comedy', name: 'Comedy Beat', description: 'Funny moment sound', file: null },
    { id: 'dramatic', name: 'Dramatic', description: 'Tension builder', file: null },
    { id: 'applause', name: 'Applause', description: 'Audience reaction', file: null }
];

// Render audio cards
function renderAudioCards() {
    const grid = document.getElementById('audioGrid');
    grid.innerHTML = '';

    // Render default stings
    defaultStings.forEach(sting => {
        if (!sting.file) {
            const card = createPlaceholderCard(sting);
            grid.appendChild(card);
        } else {
            const card = createAudioCard(sting);
            grid.appendChild(card);
        }
    });

    // Render custom audio files
    customAudioFiles.forEach((audio, index) => {
        const card = createAudioCard({
            id: `custom-${index}`,
            name: audio.name,
            description: 'Custom audio',
            file: audio.file
        });
        grid.appendChild(card);
    });
}

// Create placeholder card for audio not yet loaded
function createPlaceholderCard(sting) {
    const card = document.createElement('div');
    card.className = 'audio-card';
    card.style.opacity = '0.6';
    card.innerHTML = `
        <h3>${sting.name}</h3>
        <p>${sting.description}</p>
        <button class="play-button" disabled>No Audio File</button>
    `;
    return card;
}

// Create audio card
function createAudioCard(audio) {
    const card = document.createElement('div');
    card.className = 'audio-card';
    card.innerHTML = `
        <h3>${audio.name}</h3>
        <p>${audio.description}</p>
        <button class="play-button" data-audio-id="${audio.id}" onclick="toggleAudio('${audio.id}')">▶ Play</button>
    `;

    // Create audio element
    if (audio.file) {
        const audioElement = new Audio();
        audioElement.src = audio.file;
        audioElement.addEventListener('ended', () => onAudioEnded(audio.id));
        audioElement.addEventListener('timeupdate', () => updateProgress(audio.id));
        audioElements[audio.id] = audioElement;
    }

    return card;
}

// Toggle audio playback
function toggleAudio(id) {
    const audio = audioElements[id];
    if (!audio) return;

    // Stop currently playing audio
    if (currentlyPlaying && currentlyPlaying !== id) {
        stopAudio(currentlyPlaying);
    }

    if (audio.paused) {
        playAudio(id);
    } else {
        stopAudio(id);
    }
}

// Play audio
function playAudio(id) {
    const audio = audioElements[id];
    if (!audio) return;

    audio.currentTime = 0; // Start from beginning
    audio.play();
    currentlyPlaying = id;

    // Update UI
    updatePlayButton(id, true);
    showNowPlaying(id);
}

// Stop audio
function stopAudio(id) {
    const audio = audioElements[id];
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;

    // Update UI
    updatePlayButton(id, false);
    
    if (currentlyPlaying === id) {
        currentlyPlaying = null;
        hideNowPlaying();
    }
}

// Audio ended callback
function onAudioEnded(id) {
    updatePlayButton(id, false);
    if (currentlyPlaying === id) {
        currentlyPlaying = null;
        hideNowPlaying();
    }
}

// Update play button state
function updatePlayButton(id, isPlaying) {
    const buttons = document.querySelectorAll('.play-button');
    buttons.forEach(button => {
        if (button.dataset.audioId === id) {
            if (isPlaying) {
                button.textContent = '⏹ Stop';
                button.classList.add('playing');
            } else {
                button.textContent = '▶ Play';
                button.classList.remove('playing');
            }
        }
    });
}

// Show now playing section
function showNowPlaying(id) {
    const nowPlaying = document.getElementById('nowPlaying');
    const trackName = document.getElementById('currentTrackName');
    
    // Find audio name
    let audioName = 'Unknown';
    const defaultSting = defaultStings.find(s => s.id === id);
    if (defaultSting) {
        audioName = defaultSting.name;
    } else {
        const customIndex = parseInt(id.replace('custom-', ''));
        if (!isNaN(customIndex) && customAudioFiles[customIndex]) {
            audioName = customAudioFiles[customIndex].name;
        }
    }

    trackName.textContent = audioName;
    nowPlaying.classList.add('active');
}

// Hide now playing section
function hideNowPlaying() {
    const nowPlaying = document.getElementById('nowPlaying');
    nowPlaying.classList.remove('active');
    document.getElementById('progressFill').style.width = '0%';
}

// Update progress bar
function updateProgress(id) {
    if (currentlyPlaying !== id) return;

    const audio = audioElements[id];
    if (!audio) return;

    const progress = (audio.currentTime / audio.duration) * 100;
    document.getElementById('progressFill').style.width = `${progress}%`;
}

// Add custom audio
function addCustomAudio() {
    const fileInput = document.getElementById('audioFileInput');
    const statusMessage = document.getElementById('statusMessage');
    
    if (!fileInput.files || fileInput.files.length === 0) {
        showStatus('Please select at least one audio file', 'error');
        return;
    }

    let addedCount = 0;
    Array.from(fileInput.files).forEach(file => {
        if (file.type.startsWith('audio/')) {
            const url = URL.createObjectURL(file);
            customAudioFiles.push({
                name: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
                file: url,
                objectUrl: url // Store for cleanup
            });
            addedCount++;
        }
    });

    renderAudioCards();
    fileInput.value = ''; // Clear input
    
    if (addedCount > 0) {
        showStatus(`Added ${addedCount} audio file(s)`, 'success');
    } else {
        showStatus('No valid audio files were selected', 'error');
    }
}

// Cleanup object URLs on page unload
window.addEventListener('beforeunload', () => {
    customAudioFiles.forEach(audio => {
        if (audio.objectUrl) {
            URL.revokeObjectURL(audio.objectUrl);
        }
    });
});
