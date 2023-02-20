ELEMENTS.deckCardsContainer.onCardsModified = () => {
    ELEMENTS.totalCardsInDeck.innerHTML = ELEMENTS.deckCardsContainer.cards.length

    // GLOBAL.localStorage['deck-builder']['deck-card-ids'] = []
    // for (let i = 0; i < ELEMENTS.deckCardsContainer.cards.length; i++) {
    //     if (ELEMENTS.deckCardsContainer.cards[i].data && ELEMENTS.deckCardsContainer.cards[i].data.id) {
    //         GLOBAL.localStorage['deck-builder']['deck-card-ids'].push(ELEMENTS.deckCardsContainer.cards[i].data.id)
    //     }
    // }
    // console.log(GLOBAL.localStorage['deck-builder']['deck-card-ids'])
}