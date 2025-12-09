# 🎙️ Pitch-Off Podcast Dashboard

A lightweight, instant-play dashboard for managing podcast audio stings and production tools.

## Features

### Current Features
- **Instant Audio Playback**: Load and play audio files with zero latency
- **Custom Audio Upload**: Add your own audio stings through the browser interface
- **Visual Feedback**: See what's currently playing with progress tracking
- **Keyboard Shortcuts**: Press Space to stop playback instantly
- **Responsive Design**: Works on desktop and mobile browsers
- **No Installation Required**: Just open `index.html` in your browser
- **🎬 TMDB Integration**: Access trending actors data from The Movie Database
  - View list of top trending actors
  - Generate random high trending actor
  - Filter trending actors by genre
  - See actor popularity and known works

## Quick Start

1. **Clone or download this repository**
   ```bash
   git clone https://github.com/roman9891/pitch-off-dashboard.git
   cd pitch-off-dashboard
   ```

2. **Open the dashboard**
   - Simply open `index.html` in any modern web browser
   - No build process or dependencies required!

3. **Add your audio files**
   - Click "Choose Files" under "Load Custom Audio"
   - Select your audio sting files (MP3, WAV, OGG, etc.)
   - Click "Add to Dashboard"

4. **Set up TMDB Integration (Optional)**
   - Get a free API key from [The Movie Database](https://www.themoviedb.org/settings/api)
   - Enter your API key in the "Trending Actors (TMDb)" section
   - Click "Save Key" to enable trending actors features

5. **Start using**
   - Click any audio card to play the sting instantly
   - Press Space to stop playback
   - Use trending actors data during podcast recording
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

### Keyboard Shortcuts

- **Space**: Stop currently playing audio (works when not focused on input fields)

### Using Trending Actors

1. **Load Trending Actors**: Click "🔥 Load Trending Actors" to fetch the latest trending actors
2. **Random Actor**: Click "🎲 Random Trending Actor" to generate a random high-trending actor
3. **Filter by Genre**: Use the genre dropdown to filter actors by movie genre
4. **View Details**: See actor popularity scores and their known works

### During Recording

1. Keep the dashboard open on a second monitor or device
2. Click audio cards to trigger stings during recording
3. Reference trending actors for podcast topics or games
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