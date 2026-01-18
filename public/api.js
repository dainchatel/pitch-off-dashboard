// TMDB API state - now uses server proxy endpoints
let currentGenreFilter = '';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w185';
const NO_IMAGE_PLACEHOLDER = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="120" viewBox="0 0 80 120"%3E%3Crect fill="%23ddd" width="80" height="120"/%3E%3Ctext x="50%25" y="50%25" font-size="14" fill="%23999" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';

// Initialize TMDB section
async function initTmdb() {
    const tmdbContent = document.getElementById('tmdbContent');
    const tmdbNoKey = document.getElementById('tmdbNoKey');
    const studioNoteContent = document.getElementById('studioNoteContent');
    const studioNoteNoKey = document.getElementById('studioNoteNoKey');
    
    if (!tmdbContent || !tmdbNoKey) {
        console.error('TMDb elements not found');
        return;
    }
    
    // Check if server is available by trying to load genres
    try {
        const response = await fetch('/api/tmdb/genres');
        if (response.ok) {
            const data = await response.json();
            // Check if we got an error response
            if (data.error) {
                tmdbContent.style.display = 'none';
                tmdbNoKey.style.display = 'block';
                if (studioNoteContent) studioNoteContent.style.display = 'none';
                if (studioNoteNoKey) studioNoteNoKey.style.display = 'block';
            } else {
                tmdbContent.style.display = 'block';
                tmdbNoKey.style.display = 'none';
                if (studioNoteContent) studioNoteContent.style.display = 'block';
                if (studioNoteNoKey) studioNoteNoKey.style.display = 'none';
            }
        } else {
            tmdbContent.style.display = 'none';
            tmdbNoKey.style.display = 'block';
            if (studioNoteContent) studioNoteContent.style.display = 'none';
            if (studioNoteNoKey) studioNoteNoKey.style.display = 'block';
        }
    } catch (error) {
        console.error('Error initializing TMDb:', error);
        tmdbContent.style.display = 'none';
        tmdbNoKey.style.display = 'block';
        if (studioNoteContent) studioNoteContent.style.display = 'none';
        if (studioNoteNoKey) studioNoteNoKey.style.display = 'block';
    }
}


// Load popular actors - shows up to 9 actors (server already shuffles them)
async function loadTrendingActors() {
    const container = document.getElementById('actorsContainer');
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

// Load random movie for Studio Note
async function loadRandomMovie() {
    const container = document.getElementById('movieContainer');
    container.innerHTML = '<div class="loading-message">Loading random movie...</div>';
    
    try {
        const response = await fetch('/api/tmdb/random-movie');
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        
        const movie = await response.json();
        displayMovie(movie);
    } catch (error) {
        const errorMsg = escapeHtml(error.message || 'Unknown error');
        container.innerHTML = `<div class="error-message">Error: ${errorMsg}</div>`;
        console.error('Error loading random movie:', error);
    }
}

// Display movie
function displayMovie(movie) {
    const container = document.getElementById('movieContainer');
    
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
    
    container.innerHTML = `
        <div class="movie-card" style="display: flex; gap: 20px; background: #f8f9fa; border-radius: 10px; padding: 20px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
            <img src="${escapeHtml(posterUrl)}" alt="${movieTitle}" style="width: 200px; height: 300px; object-fit: cover; border-radius: 5px; background: #ddd;" onerror="this.src='${NO_IMAGE_PLACEHOLDER}'">
            <div style="flex: 1;">
                <h3 style="color: #667eea; font-size: 1.5em; margin-bottom: 10px;">${movieTitle}</h3>
                <p style="color: #666; margin-bottom: 10px;"><strong>Year:</strong> ${movieYear} | <strong>Rating:</strong> ⭐ ${movieRating}</p>
                <p style="color: #333; line-height: 1.6;">${movieOverview}</p>
            </div>
        </div>
    `;
}
