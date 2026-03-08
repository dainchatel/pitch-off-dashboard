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
        name: "Taglines",
        action: [playOneSting("./audio/stings/taglines.wav")]
    },
    {
        name: "Celeb Corner",
        action: [playOneSting("./audio/stings/celeb-corner.wav"), generateRandomActors(5)],
    },
    {
        name: "Action!",
        action: [function() { playManualSting('action_sting'); }]
    },
    {
        name: "Studio Notes",
        action: [playOneSting("./audio/stings/studio-notes.wav"), generateRandomMovie()],
    },
    {
        name: "Viral Marketing",
        action: [playOneSting("./audio/stings/viral-marketing.wav")]
    }
]
