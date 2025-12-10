// Segment action functions
// These functions are called when segments are triggered in automatic timer mode

// Global state for audio stings loaded from directory
let stingAudioFiles = {};

// Load audio stings from the public audio directory at runtime
async function loadStingsFromDirectory() {
    try {
        const stingsPath = './audio/stings/';
        
        // Try to fetch the directory listing (this requires a web server)
        // For local file:// protocol, we'll use a predefined list
        const stingFiles = [
            'lightning-round.mp3',
            'crunch-numbers.mp3',
            'show-footage.mp3',
            'show-footage-alt.mp3',
            'tagline-title.mp3',
            'meetings.mp3'
        ];
        
        // Load each audio file
        for (const filename of stingFiles) {
            const path = stingsPath + filename;
            try {
                // Create audio element and preload
                const audio = new Audio(path);
                audio.preload = 'auto';
                
                // Store by filename (without extension)
                const name = filename.replace(/\.[^/.]+$/, '');
                stingAudioFiles[name] = audio;
                
                console.log(`Loaded sting: ${name}`);
            } catch (err) {
                console.warn(`Could not load audio file: ${path}`, err);
            }
        }
        
        console.log('Loaded stings:', Object.keys(stingAudioFiles));
    } catch (error) {
        console.error('Error loading stings from directory:', error);
    }
}

// Play a single audio sting
function playOneSting(stingPath) {
    return function() {
        console.log('Playing sting:', stingPath);
        
        // Extract filename from path
        const filename = stingPath.split('/').pop().replace(/\.[^/.]+$/, '');
        
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
            // Call the existing function to load trending actors
            loadTrendingActors();
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
