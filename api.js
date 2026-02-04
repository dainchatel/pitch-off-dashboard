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
    { type: 'simple', text: 'Can we fit this into existing IP?' }
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

// Open studio note modal
function openStudioNoteModal() {
    const modal = document.getElementById('studioNoteModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

// Close studio note modal
function closeStudioNoteModal() {
    const modal = document.getElementById('studioNoteModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Load 4 random studio notes (all different types)
async function loadRandomMovie() {
    // Open the modal (or keep it open if already open)
    openStudioNoteModal();
    
    const container = document.getElementById('studioNoteContainer');
    if (!container) return;
    
    container.innerHTML = '<div class="loading-message">Loading studio notes...</div>';
    
    try {
        // Get all available note types
        const availableTypes = ['movie', 'demo', 'rating', 'simple'];
        
        // Select 4 different notes, ensuring different types
        const selectedNotes = [];
        const usedTypes = new Set();
        const allNotes = [...STUDIO_NOTES, ...RARE_STUDIO_NOTES];
        
        // First, try to get one of each type
        for (const type of availableTypes) {
            if (selectedNotes.length >= 4) break;
            
            // Filter notes by type
            const notesOfType = allNotes.filter(note => note.type === type);
            if (notesOfType.length > 0) {
                const randomNote = notesOfType[Math.floor(Math.random() * notesOfType.length)];
                selectedNotes.push(randomNote);
                usedTypes.add(type);
            }
        }
        
        // Fill remaining slots with random notes of any type (ensuring no duplicates)
        const usedNoteTexts = new Set(selectedNotes.map(n => n.text));
        let attempts = 0;
        const maxAttempts = 100; // Safety limit
        while (selectedNotes.length < 4 && selectedNotes.length < allNotes.length && attempts < maxAttempts) {
            const randomNote = allNotes[Math.floor(Math.random() * allNotes.length)];
            if (!usedNoteTexts.has(randomNote.text)) {
                selectedNotes.push(randomNote);
                usedNoteTexts.add(randomNote.text);
            }
            attempts++;
        }
        
        // Shuffle the selected notes
        for (let i = selectedNotes.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [selectedNotes[i], selectedNotes[j]] = [selectedNotes[j], selectedNotes[i]];
        }
        
        // Process and display all notes
        const notePromises = selectedNotes.map(async (note) => {
            if (note.type === 'movie') {
                // Fetch a movie for this note
                const response = await fetch('/api/tmdb/random-movie');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const movie = await response.json();
                return { type: 'movie', note: note, movie: movie };
            } else if (note.type === 'demo') {
                const randomDemo = DEMOS[Math.floor(Math.random() * DEMOS.length)];
                return { type: 'demo', note: note, demo: randomDemo };
            } else if (note.type === 'rating') {
                const randomRating = RATINGS[Math.floor(Math.random() * RATINGS.length)];
                return { type: 'rating', note: note, rating: randomRating };
            } else {
                return { type: 'simple', note: note };
            }
        });
        
        const processedNotes = await Promise.all(notePromises);
        displayMultipleStudioNotes(processedNotes);
    } catch (error) {
        const errorMsg = escapeHtml(error.message || 'Unknown error');
        container.innerHTML = `<div class="error-message">Error: ${errorMsg}</div>`;
        console.error('Error loading studio notes:', error);
    }
}

// Display multiple studio notes
function displayMultipleStudioNotes(processedNotes) {
    const container = document.getElementById('studioNoteContainer');
    
    let html = '<div class="studio-notes-list">';
    
    processedNotes.forEach((processedNote) => {
        const note = processedNote.note;
        let noteText = note.text;
        
        if (processedNote.type === 'movie' && processedNote.movie) {
            const movie = processedNote.movie;
            const movieTitle = escapeHtml(movie.title || movie.original_title || 'Unknown');
            noteText = noteText.replace('[RANDOM MOVIE]', movieTitle);
            
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
            
            html += `
                <div class="studio-note-item">
                    <div class="studio-note-text" style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin-bottom: 15px; border-radius: 5px; font-size: 1.2em; font-weight: bold; color: #856404;">
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
                </div>
            `;
        } else if (processedNote.type === 'demo') {
            noteText = noteText.replace('[RANDOM DEMO]', processedNote.demo);
            html += `
                <div class="studio-note-item">
                    <div class="studio-note-text" style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; border-radius: 5px; font-size: 1.2em; font-weight: bold; color: #856404;">
                        ${escapeHtml(noteText)}
                    </div>
                </div>
            `;
        } else if (processedNote.type === 'rating') {
            noteText = noteText.replace('[RANDOM RATING]', processedNote.rating);
            html += `
                <div class="studio-note-item">
                    <div class="studio-note-text" style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; border-radius: 5px; font-size: 1.2em; font-weight: bold; color: #856404;">
                        ${escapeHtml(noteText)}
                    </div>
                </div>
            `;
        } else {
            html += `
                <div class="studio-note-item">
                    <div class="studio-note-text" style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; border-radius: 5px; font-size: 1.2em; font-weight: bold; color: #856404;">
                        ${escapeHtml(noteText)}
                    </div>
                </div>
            `;
        }
    });
    
    html += '</div>';
    container.innerHTML = html;
}
