# 🎙️ Pitch-Off Podcast Dashboard

A lightweight, instant-play dashboard for managing podcast audio stings and production tools.

## Features

### Current Features
- **⏱️ Podcast Timer**: 30-minute countdown timer prominently displayed at the top
  - Start, pause, and reset controls
  - Visual warning when under 5 minutes remain
  - Audio alert when timer completes
- **Instant Audio Playback**: Load and play audio files with zero latency
- **Custom Audio Upload**: Add your own audio stings through the browser interface
- **Visual Feedback**: See what's currently playing with progress tracking
- **Keyboard Shortcuts**: Press Space to stop playback instantly
- **Responsive Design**: Works on desktop and mobile browsers
- **No Installation Required**: Just open `index.html` in your browser
- **🎬 TMDB Integration**: Access popular actors data from The Movie Database
  - View list of top popular actors
  - Generate random high popular actor
  - Filter popular actors by genre
  - See actor popularity and known works
  - Environment variable support for API key

## Quick Start

1. **Clone or download this repository**
   ```bash
   git clone https://github.com/roman9891/pitch-off-dashboard.git
   cd pitch-off-dashboard
   ```

2. **Set up TMDb API key (Optional)**
   - Edit `config.js` and add your API key (this file is gitignored)
   - For deployment (Heroku, etc.), set `TMDB_API_KEY` as an environment variable

3. **Open the dashboard**
   - Simply open `index.html` in any modern web browser
   - No build process required!

3. **Add your audio files**
   - Click "Choose Files" under "Load Custom Audio"
   - Select your audio sting files (MP3, WAV, OGG, etc.)
   - Click "Add to Dashboard"

4. **Set up TMDB Integration (Optional)**
   - Get a free API key from [The Movie Database](https://www.themoviedb.org/settings/api)
   - **For local development**: Edit `config.js` and add your API key
   - **For deployment (Heroku, etc.)**: Set `TMDB_API_KEY` as an environment variable

5. **Start using**
   - Open `index.html` in your browser
   - Click any audio card to play the sting instantly
   - Press Space to stop playback
   - Use popular actors data during podcast recording
   - Use during podcast recording for smooth transitions

## Usage

### Adding Audio Stings

You can add audio files in two ways:

1. **Through the Dashboard** (Recommended for instant use)
   - Click the file input button
   - Select one or multiple audio files
   - Click "Add to Dashboard"
   - Files are instantly available for playback

2. **Using the Audio Directory**
   - Place your audio files in the `audio/stings/` directory
   - See `audio/README.md` for naming conventions

### Using the Podcast Timer

1. **Start Timer**: Click "▶️ Start" to begin the 30-minute countdown
2. **Pause Timer**: Click "⏸️ Pause" to pause the countdown (button enabled only when timer is running)
3. **Reset Timer**: Click "🔄 Reset" to reset the timer back to 30:00
4. **Visual Warning**: Timer turns red and pulses when less than 5 minutes remain
5. **Completion Alert**: An alert appears when the timer reaches 00:00

### Keyboard Shortcuts

- **Space**: Stop currently playing audio (works when not focused on input fields)

### Using Popular Actors

1. **Load Popular Actors**: Click "🔥 Get 5 Random Popular Actors" to fetch the latest popular actors
2. **Random Actor**: Click "🎲 Random Popular Actor" to generate a random high-popular actor
3. **Filter by Genre**: Use the genre dropdown to filter actors by movie genre
4. **View Details**: See actor popularity scores and their known works

### During Recording

1. Keep the dashboard open on a second monitor or device
2. Click audio cards to trigger stings during recording
3. Reference popular actors for podcast topics or games
4. Use keyboard shortcuts for quick control
5. No latency - perfect for live podcast production

## Browser Compatibility

Works in all modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

## Technical Details

- **Zero Dependencies**: Pure HTML, CSS, and JavaScript
- **Lightweight**: Single HTML file (~16KB)
- **Instant Loading**: No build process or compilation
- **Offline Capable**: Works without internet connection
- **Privacy First**: All audio processing happens in your browser

## Project Structure

```
pitch-off-dashboard/
├── index.html          # Main dashboard (open this file)
├── audio/              # Audio files directory
│   ├── README.md      # Audio management guide
│   └── stings/        # Place audio stings here
└── README.md          # This file
```

## Future Development

This dashboard is designed to be extensible. Planned features include:

- **Actor Search**: Find specific actors by name
- **Advanced Filtering**: A-list, B-list, horror specialists, etc.
- **Favorites**: Save frequently used stings and actors
- **Playlists**: Create sequences of audio stings
- **Hotkeys**: Assign number keys to specific stings
- **Enhanced Actor Details**: Show filmography and recent projects

## Contributing

This is a personal project for podcast production, but suggestions and contributions are welcome!

## License

MIT License - feel free to use and modify for your own podcast production needs.

---

**Made for the Pitch-Off Podcast** 🎬🎙️