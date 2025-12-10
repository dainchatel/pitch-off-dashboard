const segments = [
    {
        name: "Lightning Round",
        action: [playOneSting("./audio/stings/lightning-round.mp3")]
    },
    {
        name: "Crunch the Numbers",
        action: [playOneSting("./audio/stings/crunch-numbers.mp3")]
    },
    {
        name: "Show Me Some Footage",
        action: [selectFootageSting(["./audio/stings/show-footage.mp3", "./audio/stings/show-footage-alt.mp3"])]
    },
    {
        name: "Tagline or Title",
        action: [playOneSting("./audio/stings/tagline-title.mp3")]
    },
    {
        name: "Let's Take Some Meetings",
        action: [playOneSting("./audio/stings/meetings.mp3"), generateRandomActors(5)],
    }
]
