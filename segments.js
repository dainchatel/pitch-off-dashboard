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
        name: "Show Me Some Footage",
        action: [selectFootageSting(["./audio/stings/show-footage.wav", "./audio/stings/show-footage-alt.wav"])]
    },
    {
        name: "Tagline or Title",
        action: [playOneSting("./audio/stings/tagline-title.wav")]
    },
    {
        name: "Let's Take Some Meetings",
        action: [playOneSting("./audio/stings/meetings.wav"), generateRandomActors(5)],
    }
]
