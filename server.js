require('dotenv').config();
const express = require('express');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;
const TMDB_API_KEY = process.env.TMDB_API_KEY;

// Track recently shown actor IDs to avoid repeats across requests
const recentlyShownActors = new Set();
const MAX_RECENT_ACTORS = 30; // Keep track of last 30 actors shown

// Serve static files
app.use(express.static('public'));

// TMDb API proxy endpoints
app.get('/api/tmdb/genres', async (req, res) => {
    if (!TMDB_API_KEY) {
        return res.status(500).json({ error: 'TMDb API key not configured' });
    }
    
    try {
        const response = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDB_API_KEY}`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch genres' });
    }
});

app.get('/api/tmdb/random-movie', async (req, res) => {
    if (!TMDB_API_KEY) {
        return res.status(500).json({ error: 'TMDb API key not configured' });
    }
    
    try {
        // Randomly choose between popular, now_playing, and top_rated
        const endpoints = [
            { type: 'popular', minPage: 3, maxPage: 50 },
            { type: 'now_playing', minPage: 2, maxPage: 5 },
            { type: 'top_rated', minPage: 3, maxPage: 50 }
        ];
        
        const selectedEndpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
        
        // Get first page to check total pages available
        const firstPageResponse = await fetch(`https://api.themoviedb.org/3/movie/${selectedEndpoint.type}?api_key=${TMDB_API_KEY}&page=1`);
        const firstPageData = await firstPageResponse.json();
        const totalPages = firstPageData.total_pages || 1;
        
        // Determine the actual page range (don't exceed available pages)
        const maxPage = Math.min(selectedEndpoint.maxPage, totalPages);
        const minPage = Math.min(selectedEndpoint.minPage, maxPage);
        
        // Retry up to 5 times to find a movie with a poster
        const maxRetries = 5;
        let movie = null;
        
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            // Get a random page within the range
            const randomPage = Math.floor(Math.random() * (maxPage - minPage + 1)) + minPage;
            const response = await fetch(`https://api.themoviedb.org/3/movie/${selectedEndpoint.type}?api_key=${TMDB_API_KEY}&page=${randomPage}`);
            const data = await response.json();
            
            if (data.results && data.results.length > 0) {
                // Filter for movies with posters
                const moviesWithPosters = data.results.filter(m => m.poster_path && m.poster_path.trim() !== '');
                
                if (moviesWithPosters.length > 0) {
                    // Pick a random movie from those with posters
                    const randomIndex = Math.floor(Math.random() * moviesWithPosters.length);
                    movie = moviesWithPosters[randomIndex];
                    break; // Found a movie with a poster, exit retry loop
                }
            }
        }
        
        if (movie) {
            res.json(movie);
        } else {
            res.status(500).json({ error: 'No movies with posters found after retries' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch random movie' });
    }
});

app.get('/api/tmdb/popular-actors', async (req, res) => {
    if (!TMDB_API_KEY) {
        return res.status(500).json({ error: 'TMDb API key not configured' });
    }
    
    try {
        // First, get total pages to know the range
        const firstPageResponse = await fetch(`https://api.themoviedb.org/3/person/popular?api_key=${TMDB_API_KEY}&page=1`);
        const firstPageData = await firstPageResponse.json();
        const totalPages = Math.min(firstPageData.total_pages || 500, 500); // Cap at 500 pages
        
        const allActors = [];
        const seenActorIds = new Set(); // Track actor IDs to avoid duplicates in this request
        
        // Helper function to filter actors with images, exclude duplicates, and shuffle
        const getActorsWithImages = (actors, count) => {
            // Filter for actors with images, not already seen in this request, and not recently shown
            const withImages = actors.filter(actor => 
                actor.profile_path && 
                actor.profile_path.trim() !== '' &&
                !seenActorIds.has(actor.id) &&
                !recentlyShownActors.has(actor.id)
            );
            if (withImages.length === 0) return [];
            
            // Shuffle and return requested count
            const shuffled = [...withImages];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            const selected = shuffled.slice(0, Math.min(count, shuffled.length));
            
            // Mark selected actors as seen in this request
            selected.forEach(actor => seenActorIds.add(actor.id));
            
            return selected;
        };
        
        // 1) Get 3 actors from a random page between 3-20
        const page1 = Math.floor(Math.random() * (20 - 3 + 1)) + 3;
        const response1 = await fetch(`https://api.themoviedb.org/3/person/popular?api_key=${TMDB_API_KEY}&page=${page1}`);
        const data1 = await response1.json();
        if (data1.results && data1.results.length > 0) {
            allActors.push(...getActorsWithImages(data1.results, 3));
        }
        
        // 2) Get 3 actors from a random page between 20-75
        const page2 = Math.floor(Math.random() * (75 - 20 + 1)) + 20;
        const response2 = await fetch(`https://api.themoviedb.org/3/person/popular?api_key=${TMDB_API_KEY}&page=${page2}`);
        const data2 = await response2.json();
        if (data2.results && data2.results.length > 0) {
            allActors.push(...getActorsWithImages(data2.results, 3));
        }
        
        // 3) Get 3 actors from a random page between 75-150
        const maxPage3 = Math.min(150, totalPages);
        const page3 = Math.floor(Math.random() * (maxPage3 - 75 + 1)) + 75;
        const response3 = await fetch(`https://api.themoviedb.org/3/person/popular?api_key=${TMDB_API_KEY}&page=${page3}`);
        const data3 = await response3.json();
        if (data3.results && data3.results.length > 0) {
            allActors.push(...getActorsWithImages(data3.results, 3));
        }
        
        // Shuffle all actors together
        for (let i = allActors.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allActors[i], allActors[j]] = [allActors[j], allActors[i]];
        }
        
        // Add these actors to recently shown list
        allActors.forEach(actor => {
            recentlyShownActors.add(actor.id);
            // Keep the set size manageable - remove oldest if we exceed limit
            if (recentlyShownActors.size > MAX_RECENT_ACTORS) {
                // Convert to array, remove first, recreate set
                const actorsArray = Array.from(recentlyShownActors);
                recentlyShownActors.clear();
                // Keep the most recent ones (last N)
                actorsArray.slice(-MAX_RECENT_ACTORS).forEach(id => recentlyShownActors.add(id));
            }
        });
        
        res.json({ results: allActors });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch popular actors' });
    }
});

// Serve index.html for root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    if (!TMDB_API_KEY) {
        console.warn('⚠️  Warning: TMDB_API_KEY not set. TMDb features will be disabled.');
    }
});
