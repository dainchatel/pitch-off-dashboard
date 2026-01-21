// Segment action functions
// These functions are called when segments are triggered in automatic timer mode

// Global state for audio stings loaded from directory
let stingAudioFiles = {};
let currentlyPlayingSting = null;

// Helper function to remove file extension
function getFilenameWithoutExtension(filename) {
    return filename.replace(/\.[^/.]+$/, '');
}

// Load audio stings from the public audio directory at runtime
async function loadStingsFromDirectory() {
    try {
        const stingsPath = './audio/stings/';
        
        // Try to fetch the directory listing (this requires a web server)
        // For local file:// protocol, we'll use a predefined list
        const stingFiles = [
            'lightning-round.wav',
            'crunch-numbers.wav',
            'tagline-title.wav',
            'meetings.wav'
        ];
        
        // New stings that use placeholder.wav
        const placeholderStings = [
            'show-me-a-scene',
            'studio-note'
        ];
        
        // Load each audio file
        for (const filename of stingFiles) {
            const path = stingsPath + filename;
            try {
                // Create audio element and preload
                const audio = new Audio(path);
                audio.preload = 'auto';
                
                // Store by filename (without extension)
                const name = getFilenameWithoutExtension(filename);
                stingAudioFiles[name] = audio;
                
                console.log(`Loaded sting: ${name}`);
            } catch (err) {
                console.warn(`Could not load audio file: ${path}`, err);
            }
        }
        
        // Load placeholder.wav for the new stings
        const placeholderPath = stingsPath + 'placeholder.wav';
        placeholderStings.forEach(stingName => {
            try {
                // Create a new Audio instance for each sting (can't share the same instance)
                const audio = new Audio(placeholderPath);
                audio.preload = 'auto';
                stingAudioFiles[stingName] = audio;
                console.log(`Loaded sting: ${stingName} (using placeholder)`);
            } catch (err) {
                console.warn(`Could not load placeholder audio for ${stingName}: ${placeholderPath}`, err);
            }
        });
        
        console.log('Loaded stings:', Object.keys(stingAudioFiles));
        
        // Render manual stings after loading
        renderManualStings();
    } catch (error) {
        console.error('Error loading stings from directory:', error);
    }
}

// Play a single audio sting
function playOneSting(stingPath) {
    return function() {
        console.log('Playing sting:', stingPath);
        
        // Extract filename from path
        const filename = getFilenameWithoutExtension(stingPath.split('/').pop());
        
        // Try to play from loaded stings
        if (stingAudioFiles[filename]) {
            const audio = stingAudioFiles[filename];
            audio.currentTime = 0;
            audio.play().catch(err => {
                console.error('Error playing sting:', err);
            });
        } else {
            // Fallback: try to create and play audio element
            try {
                const audio = new Audio(stingPath);
                audio.play().catch(err => {
                    console.error('Error playing sting:', err);
                });
            } catch (err) {
                console.error('Could not play sting:', stingPath, err);
            }
        }
    };
}

// Select and play a random sting from an array of sting paths
function selectFootageSting(stingPaths) {
    return function() {
        if (!Array.isArray(stingPaths) || stingPaths.length === 0) {
            console.warn('No sting paths provided');
            return;
        }
        
        // Randomly select one sting
        const randomIndex = Math.floor(Math.random() * stingPaths.length);
        const selectedSting = stingPaths[randomIndex];
        
        console.log('Selected footage sting:', selectedSting);
        
        // Play the selected sting
        playOneSting(selectedSting)();
    };
}

// Generate random actors using the existing TMDB integration
function generateRandomActors(count = 5) {
    return function() {
        console.log(`Generating ${count} random actors`);
        
        // Check if TMDB functions are available
        if (typeof loadTrendingActors === 'function') {
            // Call the existing function to load popular actors
            loadTrendingActors();
        } else {
            console.warn('TMDB integration not available');
        }
    };
}

// Generate random movie for Studio Note
function generateRandomMovie() {
    return function() {
        console.log('Generating random movie');
        
        // Check if TMDB functions are available
        if (typeof loadRandomMovie === 'function') {
            // Call the existing function to load random movie
            loadRandomMovie();
        } else {
            console.warn('TMDB integration not available');
        }
    };
}

// Initialize audio loading when the page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadStingsFromDirectory);
} else {
    loadStingsFromDirectory();
}

// Render manual sting triggers in the timer section
function renderManualStings() {
    const grid = document.getElementById('manualStingsGrid');
    if (!grid) {
        console.warn('Manual stings grid not found');
        return;
    }
    
    const stingNames = Object.keys(stingAudioFiles);
    
    if (stingNames.length === 0) {
        grid.innerHTML = '<div class="loading-message">No stings loaded yet...</div>';
        return;
    }
    
    grid.innerHTML = '';
    
    stingNames.forEach(stingName => {
        const card = document.createElement('div');
        card.className = 'audio-card';
        card.setAttribute('data-sting-name', stingName);
        
        // Create a friendly display name
        let displayName = stingName
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        
        // Special cases for display names
        if (stingName === 'meetings') {
            displayName = 'Casting';
        } else if (stingName === 'tagline-title') {
            displayName = 'Tagline or Title';
        } else if (stingName === 'crunch-numbers') {
            displayName = 'Crunch the Numbers';
        } else if (stingName === 'show-me-a-scene') {
            displayName = 'Show Me a Scene';
        } else if (stingName === 'studio-note') {
            displayName = 'Studio Note';
        }
        
        card.innerHTML = `
            <h3>${displayName}</h3>
            <div style="margin-bottom: 15px;"></div>
            <button class="play-button" onclick="event.stopPropagation(); playManualSting('${stingName}')">▶ Play</button>
        `;

        // If we're in swap mode and this tile is clicked, use it for swap
        card.addEventListener('click', () => {
            if (typeof handleSwapSelect === 'function') {
                const used = handleSwapSelect(displayName);
                if (used) return;
            }
            playManualSting(stingName);
        });
        
        grid.appendChild(card);
    });
}

// Play a manual sting by name
function playManualSting(stingName) {
    console.log('Playing manual sting:', stingName);
    
    if (!stingAudioFiles[stingName]) {
        console.error('Sting not found:', stingName);
        return;
    }
    
    // If another sting is playing, stop it first
    if (currentlyPlayingSting && currentlyPlayingSting !== stingName) {
        stopManualSting(currentlyPlayingSting);
    }
    
    // If clicking the same sting that's playing, stop it
    if (currentlyPlayingSting === stingName) {
        stopManualSting(stingName);
        return;
    }
    
    const audio = stingAudioFiles[stingName];
    audio.currentTime = 0;
    
    // Set up ended event listener
    const onEnded = () => {
        stopManualSting(stingName);
        audio.removeEventListener('ended', onEnded);
    };
    audio.addEventListener('ended', onEnded);
    
    audio.play().catch(err => {
        console.error('Error playing sting:', err);
        stopManualSting(stingName);
    });
    
    // If this is the "Casting" sting (meetings), also trigger random actors
    if (stingName === 'meetings' && typeof loadTrendingActors === 'function') {
        loadTrendingActors();
    }
    
    // If this is the "Studio Note" sting, also trigger random movie
    if (stingName === 'studio-note' && typeof loadRandomMovie === 'function') {
        loadRandomMovie();
    }
    
    // If this is "Show Me a Scene", open the scene modal
    if (stingName === 'show-me-a-scene') {
        openSceneModal();
    }
    
    // Update UI
    currentlyPlayingSting = stingName;
    updateStingCards();
}

// Stop a manual sting
function stopManualSting(stingName) {
    if (!stingAudioFiles[stingName]) {
        return;
    }
    
    const audio = stingAudioFiles[stingName];
    audio.pause();
    audio.currentTime = 0;
    
    if (currentlyPlayingSting === stingName) {
        currentlyPlayingSting = null;
        updateStingCards();
    }
}

// Update sting cards UI (border and disabled state)
function updateStingCards() {
    const cards = document.querySelectorAll('.audio-card[data-sting-name]');
    
    cards.forEach(card => {
        const stingName = card.getAttribute('data-sting-name');
        const button = card.querySelector('.play-button');
        
        if (currentlyPlayingSting === stingName) {
            // Add border to playing card
            card.classList.add('playing');
            button.textContent = '⏹ Stop';
            button.classList.add('playing');
        } else {
            // Remove border from non-playing cards
            card.classList.remove('playing');
            button.textContent = '▶ Play';
            button.classList.remove('playing');
            
            // Disable other cards if one is playing
            if (currentlyPlayingSting) {
                card.classList.add('disabled');
                button.disabled = true;
            } else {
                card.classList.remove('disabled');
                button.disabled = false;
            }
        }
    });
}

// Scene modal functions
let currentSceneAudio = null;
let selectedSceneCard = null;

function openSceneModal() {
    const modal = document.getElementById('sceneModal');
    if (modal) {
        modal.style.display = 'flex';
        // Reset any previously selected scene card
        if (selectedSceneCard) {
            selectedSceneCard.classList.remove('playing');
            selectedSceneCard = null;
        }
        // Stop any currently playing scene audio
        if (currentSceneAudio) {
            currentSceneAudio.pause();
            currentSceneAudio = null;
        }
    }
}

function closeSceneModal() {
    const modal = document.getElementById('sceneModal');
    if (modal) {
        modal.style.display = 'none';
        // Reset selected scene card
        if (selectedSceneCard) {
            selectedSceneCard.classList.remove('playing');
            selectedSceneCard = null;
        }
        // Stop any playing audio
        if (currentSceneAudio) {
            currentSceneAudio.pause();
            currentSceneAudio = null;
        }
    }
}

function selectSceneType(sceneType) {
    // Remove previous selection
    if (selectedSceneCard) {
        selectedSceneCard.classList.remove('playing');
    }
    
    // Map sceneType to display names
    const sceneTypeMap = {
        'emotional': 'Emotional',
        'action': 'Action',
        'trailer': 'Trailer',
        'comedic': 'Comedic',
        'gloomy': 'Gloomy'
    };
    
    const displayName = sceneTypeMap[sceneType] || sceneType;
    
    // Find and highlight the selected card
    const sceneCards = document.querySelectorAll('.scene-card');
    sceneCards.forEach(card => {
        if (card.textContent.trim() === displayName) {
            card.classList.add('playing');
            selectedSceneCard = card;
        }
    });
    
    // Stop any currently playing audio
    if (currentSceneAudio) {
        currentSceneAudio.pause();
    }
    
    // Play placeholder sound
    const audio = new Audio('./audio/stings/placeholder.wav');
    currentSceneAudio = audio;
    
    // Set up ended event listener to close modal when sound finishes
    const onEnded = () => {
        closeSceneModal();
        audio.removeEventListener('ended', onEnded);
        currentSceneAudio = null;
    };
    audio.addEventListener('ended', onEnded);
    
    audio.play().catch(err => {
        console.error('Error playing scene sound:', err);
        // If play fails, close modal anyway
        closeSceneModal();
    });
}
