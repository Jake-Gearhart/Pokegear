focused.show = (card) => {
    focused.classList.remove('hidden')

    const siblings = Array.from(card.parentElement.querySelectorAll('pokemon-card'))
    const cardIndex = siblings.indexOf(card)

    while (ELEMENTS.focusedCardsContainer.firstChild) {
        ELEMENTS.focusedCardsContainer.firstChild.remove()
    }
    ELEMENTS.focusedCardsContainer.cards = {}
    ELEMENTS.focusedCardsContainer.source = card.parentElement

    for (let i = -4; i <= 4; i++) {
        if (i + cardIndex >= 0 && i + cardIndex < siblings.length) {
            const newCard = document.createElement('pokemon-card')
            newCard.classList.add('focused-card')
            newCard.setAttribute('position', Math.max(Math.min(i, 3), -3))
            newCard.index = cardIndex + i

            ELEMENTS.focusedCardsContainer.appendChild(newCard)
            ELEMENTS.focusedCardsContainer.cards[cardIndex + i] = newCard

            const sourceCard = siblings[cardIndex + i]
            newCard.setData(sourceCard.data, sourceCard.dataSource)
            newCard.checkLoadData()

            if (i == 0) { focused.setFocusedCard(newCard) }
        }
    }
}

focused.setFocusedCard = (card) => {
    focused.focusedCard = card
    card.hover()
    ELEMENTS.focusedPrice.innerHTML = ''

    if (card.data && card.data['tcgplayer'] && card.data['tcgplayer']['prices']) {
        for (const category in card.data['tcgplayer']['prices']) {
            const categoryElm = document.createElement('b')
            categoryElm.innerText = `${category.replace(/^\w/, text => text.toUpperCase()).split(/(?=[A-Z])/).join(' ')}`
            ELEMENTS.focusedPrice.appendChild(categoryElm)

            const priceTable = document.createElement('grid')
            ELEMENTS.focusedPrice.appendChild(priceTable)

            for (const price in card.data['tcgplayer']['prices'][category]) {
                const priceTitleElm = document.createElement('div')
                priceTitleElm.innerText = price.replace(/^\w/, text => text.toUpperCase()).split(/(?=[A-Z])/).join(' ')

                const priceValue = card.data['tcgplayer']['prices'][category][price]
                if (priceValue) {
                    const priceValueElm = document.createElement('number')
                    priceValueElm.innerText = `$${priceValue.toFixed(2)}`
                    priceValueElm.style['color'] = `hsl(${120 - 120 * (Math.log10(Math.min(priceValue, 100) + 1) / 2)}, 87.5%, 50%)`

                    if (price == 'market') {
                        priceTable.prepend(priceValueElm)
                        priceTable.prepend(priceTitleElm)
                    }
                    else {
                        priceTable.appendChild(priceTitleElm)
                        priceTable.appendChild(priceValueElm)
                    }
                }
            }
        }
    }
    else {
        const noPricesElm = document.createElement('b')
        noPricesElm.innerText = 'No Prices Available'
        ELEMENTS.focusedPrice.appendChild(noPricesElm)
    }
}

focused.click = (event) => {
    ELEMENTS.focusedCardsContainer.classList.add('click')
    const card = document.elementFromPoint(event.x, event.y).closest('POKEMON-CARD')
    ELEMENTS.focusedCardsContainer.classList.remove('click')

    if (card) { ELEMENTS.focusedCardsContainer.scrollToIndex(card.index) }
    else { focused.classList.add('hidden') }
}

focused.scroll = () => {
    if (focused.classList.contains('hidden') || !GLOBAL.latestWheelEvent) { return }

    focused.scrollAmount = (focused.scrollAmount || 0) + Math.clamp(GLOBAL.latestWheelEvent.wheelDelta, -50, 50) //larger number increases max speed

    if (focused.scrollAmount <= -300) { //larger number decreases min speed
        ELEMENTS.focusedCardsContainer.scrollToIndex(focused.focusedCard.index + 1)
        focused.scrollAmount = 0
    }
    else if (focused.scrollAmount >= 300) {
        ELEMENTS.focusedCardsContainer.scrollToIndex(focused.focusedCard.index - 1)
        focused.scrollAmount = 0
    }
}

ELEMENTS.focusedCardsContainer.scrollToIndex = (newIndex) => {
    // console.log(Object.assign({}, ELEMENTS.focusedCardsContainer.cards))

    const oldIndex = focused.focusedCard.index
    if (oldIndex == newIndex || newIndex < 0) { return }

    const sourceCards = Array.from(ELEMENTS.focusedCardsContainer.source.querySelectorAll('pokemon-card'))

    if (newIndex > sourceCards.length - 1) { return }

    focused.focusedCard.unhover()

    //fetch missing cards
    for (let i = newIndex - 4; i <= newIndex + 4; i++) {
        if (!ELEMENTS.focusedCardsContainer.cards[i] && i >= 0 && i < sourceCards.length) {
            const newCard = document.createElement('pokemon-card')

            newCard.classList.add('focused-card')
            newCard.index = i

            ELEMENTS.focusedCardsContainer.cards[i] = newCard
            ELEMENTS.focusedCardsContainer.appendChild(newCard)
            newCard.setData(sourceCards[i].data, sourceCards[i].dataSource)
            newCard.checkLoadData()
        }
    }

    //update positions and schedule unecessary elements for removal
    const transitionTimeMS = 1000 * parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--transition-time'))
    for (i in ELEMENTS.focusedCardsContainer.cards) {
        const card = ELEMENTS.focusedCardsContainer.cards[i]
        const newPosition = Math.clamp(i - newIndex, -5, 5)
        card.setAttribute('position', newPosition)
        if (newPosition == 5) {
            setTimeout((index) => {
                const card = ELEMENTS.focusedCardsContainer.cards[index]
                if (card && parseInt(card.getAttribute('position')) == 5) {
                    card.remove()
                    delete ELEMENTS.focusedCardsContainer.cards[index]
                }
            }, transitionTimeMS, i);
        }
        else if (newPosition == -5) {
            setTimeout((index) => {
                const card = ELEMENTS.focusedCardsContainer.cards[index]
                if (card && parseInt(card.getAttribute('position')) == -5) {
                    card.remove()
                    delete ELEMENTS.focusedCardsContainer.cards[index]
                }
            }, transitionTimeMS, i);
        }
    }

    //update center card
    focused.setFocusedCard(ELEMENTS.focusedCardsContainer.cards[newIndex])

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