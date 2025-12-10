// TMDB API state
// Check for environment variable first, then localStorage
let tmdbApiKey = '';
if (typeof TMDB_API_KEY !== 'undefined') {
    tmdbApiKey = TMDB_API_KEY;
} else {
    tmdbApiKey = localStorage.getItem('tmdbApiKey') || '';
}
let currentGenreFilter = '';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w185';
const NO_IMAGE_PLACEHOLDER = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="120" viewBox="0 0 80 120"%3E%3Crect fill="%23ddd" width="80" height="120"/%3E%3Ctext x="50%25" y="50%25" font-size="14" fill="%23999" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';

// Initialize TMDB section
function initTmdb() {
    const apiKeyInput = document.getElementById('tmdbApiKey');
    const tmdbContent = document.getElementById('tmdbContent');
    
    if (tmdbApiKey) {
        // If API key is from environment variable, show it masked
        if (typeof TMDB_API_KEY !== 'undefined') {
            apiKeyInput.value = '••••••••••••••••';
            apiKeyInput.disabled = true;
            showStatus('Using API key from environment variable', 'success', 'tmdbStatusMessage');
        } else {
            apiKeyInput.value = tmdbApiKey;
        }
        tmdbContent.style.display = 'block';
        loadGenres();
    }
}

// Save TMDB API Key
function saveTmdbApiKey() {
    const apiKeyInput = document.getElementById('tmdbApiKey');
    const key = apiKeyInput.value.trim();
    
    if (!key) {
        showStatus('Please enter a valid API key', 'error', 'tmdbStatusMessage');
        return;
    }
    
    tmdbApiKey = key;
    localStorage.setItem('tmdbApiKey', key);
    document.getElementById('tmdbContent').style.display = 'block';
    showStatus('API key saved successfully!', 'success', 'tmdbStatusMessage');
    loadGenres();
}

// Load genres from TMDB
async function loadGenres() {
    try {
        const response = await fetch(`${TMDB_BASE_URL}/genre/movie/list?api_key=${tmdbApiKey}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.genres) {
            const genreSelect = document.getElementById('genreSelect');
            genreSelect.innerHTML = '<option value="">All Genres</option>';
            
            data.genres.forEach(genre => {
                const option = document.createElement('option');
                option.value = genre.id;
                option.textContent = genre.name;
                genreSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading genres:', error);
        showStatus('Failed to load genres. Please check your API key.', 'error', 'tmdbStatusMessage');
    }
}

// Load trending actors - now shows 5 random actors
async function loadTrendingActors() {
    const container = document.getElementById('actorsContainer');
    container.innerHTML = '<div class="loading-message">Loading trending actors...</div>';
    
    try {
        // Always fetch fresh data without caching
        const timestamp = new Date().getTime();
        const response = await fetch(`${TMDB_BASE_URL}/trending/person/week?api_key=${tmdbApiKey}&_t=${timestamp}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            // Get 5 random actors from the results
            const shuffled = [...data.results].sort(() => 0.5 - Math.random());
            const randomActors = shuffled.slice(0, 5);
            displayActors(randomActors);
        } else {
            throw new Error('No trending actors found');
        }
    } catch (error) {
        const errorMsg = escapeHtml(error.message || 'Unknown error');
        container.innerHTML = `<div class="error-message">Error: ${errorMsg}. Please check your API key.</div>`;
        console.error('Error loading trending actors:', error);
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
    showStatus('Please click "Load Trending Actors" to see filtered results', 'success', 'tmdbStatusMessage');
}
