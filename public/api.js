// TMDB API state - now uses server proxy endpoints
let currentGenreFilter = '';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w185';
const NO_IMAGE_PLACEHOLDER = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="120" viewBox="0 0 80 120"%3E%3Crect fill="%23ddd" width="80" height="120"/%3E%3Ctext x="50%25" y="50%25" font-size="14" fill="%23999" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';

// Initialize TMDB section (no longer needed for UI, but keeping for API key check)
async function initTmdb() {
    // Just check if API is available - no UI elements to show/hide anymore
    try {
        const response = await fetch('/api/tmdb/genres');
        if (!response.ok) {
            console.warn('TMDb API key not configured');
        }
    } catch (error) {
        console.error('Error checking TMDb API:', error);
    }
}


// Open casting modal
function openCastingModal() {
    const modal = document.getElementById('castingModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

// Close casting modal
function closeCastingModal() {
    const modal = document.getElementById('castingModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Load popular actors - shows up to 9 actors (server already shuffles them)
async function loadTrendingActors() {
    // Open the modal (or keep it open if already open)
    openCastingModal();
    
    const container = document.getElementById('actorsContainer');
    if (!container) return;
    
    container.innerHTML = '<div class="loading-message">Loading popular actors...</div>';
    
    try {
        const response = await fetch('/api/tmdb/popular-actors');
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            // Server already returns up to 9 shuffled actors, just display them all
            displayActors(data.results);
        } else {
            throw new Error('No popular actors found');
        }
    } catch (error) {
        const errorMsg = escapeHtml(error.message || 'Unknown error');
        container.innerHTML = `<div class="error-message">Error: ${errorMsg}</div>`;
        console.error('Error loading popular actors:', error);
    }
}

// Display actors
function displayActors(actors) {
    const container = document.getElementById('actorsContainer');
    
    if (!actors || actors.length === 0) {
        container.innerHTML = '<div class="loading-message">No actors found</div>';
        return;
    }
    
    container.innerHTML = '<div class="actors-list"></div>';
    const actorsList = container.querySelector('.actors-list');
    
    actors.forEach(actor => {
        const actorCard = createActorCard(actor);
        actorsList.appendChild(actorCard);
    });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Validate image URL for security
function isValidImageUrl(url) {
    return url && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:'));
}

// Create actor card
function createActorCard(actor) {
    const card = document.createElement('div');
    card.className = 'actor-card';
    card.setAttribute('data-actor-id', actor.id);
    
    let imageSrc = NO_IMAGE_PLACEHOLDER;
    if (actor.profile_path) {
        const tmdbImageUrl = `${TMDB_IMAGE_BASE_URL}${actor.profile_path}`;
        if (isValidImageUrl(tmdbImageUrl)) {
            imageSrc = tmdbImageUrl;
        }
    }
    
    // Fix: Extract titles correctly from known_for array
    let knownFor = 'N/A';
    if (actor.known_for && Array.isArray(actor.known_for) && actor.known_for.length > 0) {
        const titles = actor.known_for.slice(0, 3).map(work => {
            // Movies have 'title', TV shows have 'name', and they also have 'original_title' or 'original_name'
            return work.title || work.name || work.original_title || work.original_name;
        }).filter(Boolean);
        
        if (titles.length > 0) {
            knownFor = titles.join(', ');
        }
    }
    
    // Use escaped values to prevent XSS
    const actorName = escapeHtml(actor.name);
    const actorPopularity = (actor.popularity || 0).toFixed(1);
    const actorKnownFor = escapeHtml(knownFor);
    const actorAlt = escapeHtml(actor.name);
    
    card.innerHTML = `
        <img src="${escapeHtml(imageSrc)}" alt="${actorAlt}" class="actor-image" data-fallback="${NO_IMAGE_PLACEHOLDER}">
        <div class="actor-info">
            <div class="actor-name">${actorName}</div>
            <div class="actor-popularity">⭐ Popularity: ${actorPopularity}</div>
            <div class="actor-known-for">Known for: ${actorKnownFor}</div>
        </div>
    `;
    
    // Set up error handler without inline event handler
    const img = card.querySelector('.actor-image');
    img.onerror = function() {
        this.onerror = null; // Prevent infinite loop
        this.src = NO_IMAGE_PLACEHOLDER;
    };
    
    return card;
}

// Filter actors by genre
function filterActorsByGenre(actors, genreId) {
    return actors.filter(actor => {
        if (!actor.known_for) return false;
        return actor.known_for.some(work => 
            work.genre_ids && work.genre_ids.includes(parseInt(genreId))
        );
    });
}

// Filter by genre (triggered by dropdown)
function filterByGenre() {
    const genreSelect = document.getElementById('genreSelect');
    currentGenreFilter = genreSelect.value;
    
    // Just show a message that user needs to reload
    showStatus('Please click "Get 5 Random Popular Actors" to see filtered results', 'success', 'tmdbStatusMessage');
}

// Studio note templates
// Movie note appears 5 times to make it much more frequent
const STUDIO_NOTES = [
    { type: 'movie', text: 'Can we make it more like [RANDOM MOVIE]?' },
    { type: 'movie', text: 'Can we make it more like [RANDOM MOVIE]?' },
    { type: 'movie', text: 'Can we make it more like [RANDOM MOVIE]?' },
    { type: 'movie', text: 'Can we make it more like [RANDOM MOVIE]?' },
    { type: 'movie', text: 'Can we make it more like [RANDOM MOVIE]?' },
    { type: 'demo', text: 'Can we make it play with [RANDOM DEMO]?' },
    { type: 'rating', text: 'Can we make it rated [RANDOM RATING]?' },
    { type: 'simple', text: 'We think it could be a franchise. Can you pitch movies two and three?' },
    { type: 'simple', text: 'Can we fit this into existing IP?' },
    { type: 'simple', text: 'We need a viral marketing play—any ideas?' }
];

// Rare studio notes (appear less frequently)
const RARE_STUDIO_NOTES = [
    { type: 'simple', text: 'Can you make it animated?' }
];

const DEMOS = [
    'Four-quadrant',
    'Date-night',
    'Oscar crowd',
    'Families',
    'Gen Z',
    'Millennials',
    'Older adults (45+)',
    'Streaming-first audience'
];

const RATINGS = ['G', 'PG', 'PG-13', 'R', 'NC-17'];

// Studio note modal state
let studioNoteAutoCloseTimer = null;

// Open studio note modal
function openStudioNoteModal() {
    const modal = document.getElementById('studioNoteModal');
    if (modal) {
        modal.style.display = 'flex';
        // Clear any existing timer
        if (studioNoteAutoCloseTimer) {
            clearTimeout(studioNoteAutoCloseTimer);
        }
        // Auto-close after 30 seconds
        studioNoteAutoCloseTimer = setTimeout(() => {
            closeStudioNoteModal();
        }, 30000);
    }
}

// Close studio note modal
function closeStudioNoteModal() {
    const modal = document.getElementById('studioNoteModal');
    if (modal) {
        modal.style.display = 'none';
        // Clear auto-close timer
        if (studioNoteAutoCloseTimer) {
            clearTimeout(studioNoteAutoCloseTimer);
            studioNoteAutoCloseTimer = null;
        }
    }
}

// Load random studio note
async function loadRandomMovie() {
    // Open the modal (or keep it open if already open)
    openStudioNoteModal();
    
    const container = document.getElementById('studioNoteContainer');
    if (!container) return;
    
    container.innerHTML = '<div class="loading-message">Loading studio note...</div>';
    
    try {
        // 10% chance to pick from rare notes, otherwise pick from regular notes
        let randomNote;
        if (Math.random() < 0.1 && RARE_STUDIO_NOTES.length > 0) {
            randomNote = RARE_STUDIO_NOTES[Math.floor(Math.random() * RARE_STUDIO_NOTES.length)];
        } else {
            randomNote = STUDIO_NOTES[Math.floor(Math.random() * STUDIO_NOTES.length)];
        }
        
        if (randomNote.type === 'movie') {
            // Fetch a movie and display with the note
            const response = await fetch('/api/tmdb/random-movie');
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            
            const movie = await response.json();
            displayStudioNoteWithMovie(randomNote.text, movie);
        } else if (randomNote.type === 'demo') {
            // Pick a random demo
            const randomDemo = DEMOS[Math.floor(Math.random() * DEMOS.length)];
            const noteText = randomNote.text.replace('[RANDOM DEMO]', randomDemo);
            displaySimpleStudioNote(noteText);
        } else if (randomNote.type === 'rating') {
            // Pick a random rating
            const randomRating = RATINGS[Math.floor(Math.random() * RATINGS.length)];
            const noteText = randomNote.text.replace('[RANDOM RATING]', randomRating);
            displaySimpleStudioNote(noteText);
        } else {
            // Simple note, just display the text
            displaySimpleStudioNote(randomNote.text);
        }
    } catch (error) {
        const errorMsg = escapeHtml(error.message || 'Unknown error');
        container.innerHTML = `<div class="error-message">Error: ${errorMsg}</div>`;
        console.error('Error loading studio note:', error);
    }
}

// Display studio note with movie
function displayStudioNoteWithMovie(noteTemplate, movie) {
    const container = document.getElementById('studioNoteContainer');
    
    if (!movie) {
        container.innerHTML = '<div class="loading-message">No movie found</div>';
        return;
    }
    
    const movieTitle = escapeHtml(movie.title || movie.original_title || 'Unknown');
    const movieYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown';
    const movieOverview = escapeHtml(movie.overview || 'No overview available');
    const movieRating = (movie.vote_average || 0).toFixed(1);
    
    let posterUrl = NO_IMAGE_PLACEHOLDER;
    if (movie.poster_path) {
        const posterPath = `https://image.tmdb.org/t/p/w300${movie.poster_path}`;
        if (isValidImageUrl(posterPath)) {
            posterUrl = posterPath;
        }
    }
    
    const noteText = noteTemplate.replace('[RANDOM MOVIE]', movieTitle);
    
    container.innerHTML = `
        <div class="studio-note-text" style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin-bottom: 20px; border-radius: 5px; font-size: 1.2em; font-weight: bold; color: #856404;">
            ${escapeHtml(noteText)}
        </div>
        <div class="movie-card">
            <img src="${escapeHtml(posterUrl)}" alt="${movieTitle}" class="movie-poster" onerror="this.src='${NO_IMAGE_PLACEHOLDER}'">
            <div class="movie-info">
                <h3 class="movie-title">${movieTitle}</h3>
                <p class="movie-meta"><strong>Year:</strong> ${movieYear} | <strong>Rating:</strong> ⭐ ${movieRating}</p>
                <p class="movie-overview">${movieOverview}</p>
            </div>
        </div>
    `;
}

// Display simple studio note (no movie)
function displaySimpleStudioNote(noteText) {
    const container = document.getElementById('studioNoteContainer');
    
    container.innerHTML = `
        <div class="studio-note-text" style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; border-radius: 5px; font-size: 1.2em; font-weight: bold; color: #856404;">
            ${escapeHtml(noteText)}
        </div>
    `;
}
