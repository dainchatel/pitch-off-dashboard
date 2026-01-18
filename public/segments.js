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
        name: "Trailer",
        action: [function() { playManualSting('trailer'); }]
    },
    {
        name: "Set Piece",
        action: [function() { playManualSting('set-piece'); }]
    },
    {
        name: "Emotional Core",
        action: [function() { playManualSting('emotional-core'); }]
    },
    {
        name: "Studio Note",
        action: [playOneSting("./audio/stings/placeholder.wav"), generateRandomMovie()],
    }
]
