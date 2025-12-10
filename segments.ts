const segments = [
    {
        name: "Lightning Round",
        action: [playOneSting("path/to/sound.mp3")]
    },
    {
        name: "Crunch the Numbers",
        action: [playOneSting("path/to/sound.mp3")]
    },
    {
        name: "Show Me Some Footage",
        action: [selectFootageSting(["path/to/sound1.mp3", "path/to/sound2.mp3"])]
    },
    {
        name: "Tagline or Title",
        action: [playOneSting("path/to/sound.mp3")]
    },
    {
        name: "Let's Take Some Meetings",
        action: [playOneSting("path/to/sound.mp3"), generateRandomActors(5)],
    }
]
