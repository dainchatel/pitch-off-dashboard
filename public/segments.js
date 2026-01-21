const segments = [
    {
        name: "Lightning Round",
        action: [playOneSting("./audio/stings/lightning-round.wav")]
    },
    {
        name: "Crunch the Numbers",
        action: [playOneSting("./audio/stings/crunch-numbers.wav")]
    },
    {
        name: "Tagline or Title",
        action: [playOneSting("./audio/stings/tagline-title.wav")]
    },
    {
        name: "Casting",
        action: [playOneSting("./audio/stings/meetings.wav"), generateRandomActors(5)],
    },
    {
        name: "Show Me a Scene",
        action: [function() { playManualSting('show-me-a-scene'); }]
    },
    {
        name: "Studio Note",
        action: [playOneSting("./audio/stings/placeholder.wav"), generateRandomMovie()],
    }
]
