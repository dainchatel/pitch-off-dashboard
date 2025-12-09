# Audio Files Directory

This directory is for storing your podcast audio stings and sound effects.

## Directory Structure

```
audio/
└── stings/          # Place your audio sting files here
    ├── intro.mp3
    ├── transition.mp3
    ├── outro.mp3
    └── ...
```

## Supported Audio Formats

The dashboard supports all standard web audio formats:
- MP3 (.mp3)
- WAV (.wav)
- OGG (.ogg)
- M4A (.m4a)
- FLAC (.flac)

## Adding Audio Files

### Method 1: Use the Dashboard Upload Feature
1. Open `index.html` in your browser
2. Click "Choose Files" under "Load Custom Audio"
3. Select one or more audio files
4. Click "Add to Dashboard"

### Method 2: Place Files in this Directory
To use pre-defined sting slots, name your files according to these conventions:
- `intro.mp3` - Opening theme
- `transition.mp3` - Segment transition sound
- `outro.mp3` - Closing theme
- `comedy.mp3` - Comedy beat/funny moment sound
- `dramatic.mp3` - Dramatic/tension builder
- `applause.mp3` - Audience reaction

**Note:** The current version uses the browser upload feature for instant playback. In future versions, you'll be able to reference files from this directory directly.

## Tips for Audio Stings

- Keep files short (2-10 seconds is ideal for stings)
- Use consistent audio levels across all files
- Consider using compressed formats (MP3, OGG) for smaller file sizes
- Test playback before using in live recording
