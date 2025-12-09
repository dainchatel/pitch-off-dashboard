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

### Coming Soon
- 🎬 Movie Database Integration: Look up Hollywood actors and their stats
- 📊 Actor filtering by category (Horror, Action, Comedy, etc.)
- ⭐ A-list/B-list actor classification
- 🔗 Integration with The Movie Database (TMDb)

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

4. **Start using**
   - Click any audio card to play the sting instantly
   - Press Space to stop playback
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

### During Recording

1. Keep the dashboard open on a second monitor or device
2. Click audio cards to trigger stings during recording
3. Use keyboard shortcuts for quick control
4. No latency - perfect for live podcast production

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

- **Movie Database Integration**: Integration with TMDb API for actor lookups
- **Actor Search**: Find actors by name, category, or film type
- **Filtering System**: A-list, B-list, horror specialists, etc.
- **Favorites**: Save frequently used stings and actors
- **Playlists**: Create sequences of audio stings
- **Hotkeys**: Assign number keys to specific stings

## Contributing

This is a personal project for podcast production, but suggestions and contributions are welcome!

## License

MIT License - feel free to use and modify for your own podcast production needs.

---

**Made for the Pitch-Off Podcast** 🎬🎙️