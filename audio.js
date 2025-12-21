// Global audio state
let audioElements = {};
let currentlyPlaying = null;
let customAudioFiles = [];

// Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Default stings removed - audio files now loaded from directory at runtime

// Render audio cards
function renderAudioCards() {
    const grid = document.getElementById('audioGrid');
    grid.innerHTML = '';

    // Render custom audio files only
    customAudioFiles.forEach((audio, index) => {
        const card = createAudioCard({
            id: `custom-${index}`,
            name: audio.name,
            description: 'Custom audio',
            file: audio.file
        });
        grid.appendChild(card);
    });
    
    // Show message if no custom audio loaded
    if (customAudioFiles.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #666; padding: 20px;">No custom audio files loaded. Add audio files using the upload button above.</div>';
    }
}

// Removed createPlaceholderCard - no longer needed

// Create audio card
function createAudioCard(audio) {
    const card = document.createElement('div');
    card.className = 'audio-card';
    card.innerHTML = `
        <h3>${escapeHtml(audio.name)}</h3>
        <p>${escapeHtml(audio.description)}</p>
        <button class="play-button" data-audio-id="${escapeHtml(audio.id)}" onclick="toggleAudio('${escapeHtml(audio.id)}')">▶ Play</button>
    `;

    // Create audio element
    if (audio.file) {
        const audioElement = new Audio();
        audioElement.src = audio.file;
        audioElement.addEventListener('ended', () => onAudioEnded(audio.id));
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
    }
}

// Audio ended callback
function onAudioEnded(id) {
    updatePlayButton(id, false);
    if (currentlyPlaying === id) {
        currentlyPlaying = null;
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

// Removed showNowPlaying, hideNowPlaying, and updateProgress - no longer needed without Now Playing section

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
