# Audio Files Directory

This directory is for storing your podcast audio stings and sound effects.

## Directory Structure

```
audio/
└── stings/          # Place your audio sting files here
    ├── lightning-round.wav
    ├── crunch-numbers.wav
    ├── show-footage.wav
    ├── show-footage-alt.wav
    ├── tagline-title.wav
    └── meetings.wav
```

## Supported Audio Formats

The dashboard supports all standard web audio formats:
- MP3 (.mp3)
- WAV (.wav)
- OGG (.ogg)
- M4A (.m4a)
- FLAC (.flac)

## Adding Audio Files

### For Automatic Timer Segments
The timer's automatic mode uses specific audio files from this directory for segment triggers. Place your audio files with these exact names:

- `lightning-round.wav` - For "Lightning Round" segment
- `crunch-numbers.wav` - For "Crunch the Numbers" segment
- `show-footage.wav` - For "Show Me Some Footage" segment (option 1)
- `show-footage-alt.wav` - For "Show Me Some Footage" segment (option 2)
- `tagline-title.wav` - For "Tagline or Title" segment
- `meetings.wav` - For "Let's Take Some Meetings" segment

**Note:** These files are automatically loaded at runtime and will be played when segments are triggered at the 20-minute and 10-minute marks in automatic mode.

### For Manual Dashboard Use
You can also upload custom audio files through the dashboard:
1. Open `index.html` in your browser
2. Click "Choose Files" under "Load Custom Audio"
3. Select one or more audio files
4. Click "Add to Dashboard"

## Tips for Audio Stings

- Keep files short (2-10 seconds is ideal for stings)
- Use consistent audio levels across all files
- Consider using compressed formats (MP3, OGG) for smaller file sizes
- Test playback before using in live recording
- The provided placeholder files are simple beeps - replace them with your actual podcast stings
