focused.show = (card) => {
    focused.classList.remove('hidden')

    const siblings = Array.from(card.parentElement.querySelectorAll('pokemon-card'))
    const cardIndex = siblings.indexOf(card)

    while (focusedCardsContainer.firstChild) {
        focusedCardsContainer.firstChild.remove()
    }
    focusedCardsContainer.cards = {}
    focusedCardsContainer.source = card.parentElement

    for (let i = -4; i <= 4; i++) {
        if (i + cardIndex >= 0 && i + cardIndex < siblings.length) {
            const newCard = document.createElement('pokemon-card')
            newCard.classList.add('focused-card')
            newCard.setAttribute('position', Math.max(Math.min(i, 3), -3))
            newCard.index = cardIndex + i

            focusedCardsContainer.appendChild(newCard)
            focusedCardsContainer.cards[cardIndex + i] = newCard

            newCard.setData(siblings[cardIndex + i].data)
            if (i == 0) { focused.focusedCard = newCard }
        }
    }

    focused.focusedCard.hover()
}

focused.click = (event) => {
    focusedCardsContainer.classList.add('click')
    const card = document.elementFromPoint(event.x, event.y).closest('POKEMON-CARD')
    focusedCardsContainer.classList.remove('click')

    if (card) { focusedCardsContainer.scrollToIndex(card.index) }
    else { focused.classList.add('hidden') }
}

focused.scroll = () => {
    if (focused.classList.contains('hidden') || !latestWheelEvent) { return }

    if (!focused.scrollAmount) { focused.scrollAmount = 0 }
    focused.scrollAmount = focused.scrollAmount + Math.max(Math.min(latestWheelEvent.wheelDelta, 50), -50) //larger number increases max speed

    if (focused.scrollAmount <= -300) { //larger number decreases min speed
        focusedCardsContainer.scrollToIndex(focused.focusedCard.index + 1)
        focused.scrollAmount = 0
    }
    else if (focused.scrollAmount >= 300) {
        focusedCardsContainer.scrollToIndex(focused.focusedCard.index - 1)
        focused.scrollAmount = 0
    }
}

focusedCardsContainer.scrollToIndex = (newIndex) => {
    // console.log(Object.assign({}, focusedCardsContainer.cards))

    const oldIndex = focused.focusedCard.index
    if (oldIndex == newIndex || newIndex < 0) { return }

    const sourceCards = Array.from(focusedCardsContainer.source.querySelectorAll('pokemon-card'))

    if (newIndex > sourceCards.length - 1) { return }

    focused.focusedCard.unhover()

    //fetch missing cards
    for (let i = newIndex - 4; i <= newIndex + 4; i++) {
        if (!focusedCardsContainer.cards[i] && i >= 0 && i < sourceCards.length) {
            const newCard = document.createElement('pokemon-card')

            newCard.classList.add('focused-card')
            newCard.index = i

            focusedCardsContainer.cards[i] = newCard
            focusedCardsContainer.appendChild(newCard)
            newCard.setData(sourceCards[i].data)
        }
    }

    //update positions and schedule unecessary elements for removal
    const transitionTimeMS = 1000 * parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--transition-time'))
    for (i in focusedCardsContainer.cards) {
        const card = focusedCardsContainer.cards[i]
        const newPosition = Math.max(Math.min(i - newIndex, 5), -5)
        card.setAttribute('position', newPosition)
        if (newPosition == 5) {
            setTimeout((index) => {
                const card = focusedCardsContainer.cards[index]
                if (card && parseInt(card.getAttribute('position')) == 5) {
                    card.remove()
                    delete focusedCardsContainer.cards[index]
                }
            }, transitionTimeMS, i);
        }
        else if (newPosition == -5) {
            setTimeout((index) => {
                const card = focusedCardsContainer.cards[index]
                if (card && parseInt(card.getAttribute('position')) == -5) {
                    card.remove()
                    delete focusedCardsContainer.cards[index]
                }
            }, transitionTimeMS, i);
        }
    }

    //update center card
    focused.focusedCard = focusedCardsContainer.cards[newIndex]
    focused.focusedCard.hover()

    let animateHoverID
    function animateHover () {
        focused.focusedCard.hover()
        animateHoverID = requestAnimationFrame(animateHover)
    }
    animateHover()

    setTimeout(() => {
        cancelAnimationFrame(animateHoverID)
    }, transitionTimeMS);
}