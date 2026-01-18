# 🎙️ Pitch-Off Dashboard

Podcast production dashboard with timer, audio stings, and TMDb integration.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file:
   ```
   TMDB_API_KEY=your_key_here
   ```

3. Run locally:
   ```bash
   npm run dev
   ```

4. Deploy to Heroku:
   - Set `TMDB_API_KEY` config var
   - Push to Heroku

## Features

- 30-minute countdown timer
- Manual/Auto mode toggle
- Audio sting tiles with visual feedback
- Random actor selection (9 actors from various popularity ranges)
- Random movie selection
- Segment-based auto mode

## Structure

- `server.js` - Express server with API proxy
- `public/` - Static files served to client
- `.env` - Environment variables (gitignored)
