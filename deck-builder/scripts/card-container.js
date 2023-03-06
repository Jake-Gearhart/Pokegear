class CardContainer extends HTMLElement {
    constructor () {
        super()
        this.cards = []
        this.resizeObserver = new ResizeObserver(() => { this.resize() })
        this.resizeObserver.observe(this)
    }
    
    connectedCallback () {
        this.addEventListener('scroll', this.scroll)

        this.addSpacers()
    }

    addSpacers () {
        this.spacerTop = document.createElement('card-container-spacer-top')
        this.appendChild(this.spacerTop)

        this.spacerBottom = document.createElement('card-container-spacer-bottom')
        this.appendChild(this.spacerBottom)
    }

    addCard (card) {
        this.cards.push(card)
        this.insertBefore(card, this.spacerBottom)
        this.onCardsModified && this.onCardsModified()
    }

    removeCard (card) {
        this.cards.splice(this.cards.indexOf(card), 1)
        card.remove()
        this.onCardsModified && this.onCardsModified()
    }

    clearCards () {
        this.innerHTML = null
        this.cards = []
        this.addSpacers()
    }

    getGrid () {
        const columns = getComputedStyle(this).gridTemplateColumns.split(' ')
        const x = columns.length
        const w = parseFloat(columns[0])
        const h = w * GLOBAL.cardHeight / GLOBAL.cardWidth
        const y = Math.ceil(this.clientHeight / h) + 1

        return {x, y, w, h}
    }

    updateVisibleCards () {
        if (this.cards.length == 0) { return }

        const grid = this.getGrid()
        const totalRows = Math.ceil(this.cards.length / grid.x)
        const paddingTop = parseFloat(window.getComputedStyle(this).paddingTop)
        const scrollPos = this.scrollTop - paddingTop
        const firstVisibleRow = Math.max(0, Math.floor(scrollPos / grid.h))

        for (let i = 0; i < this.cards.length; i++) {
            if (i >= firstVisibleRow * grid.x && i < (firstVisibleRow + grid.y) * grid.x) {
                this.cards[i].classList.remove('hidden-card')

                this.cards[i].checkLoadData()
            }
            else {
                this.cards[i].classList.add('hidden-card')
            }
        }

        this.spacerTop.style['height'] = `${firstVisibleRow * grid.h}px`
        this.spacerBottom.style['height'] = `${(totalRows - Math.min(firstVisibleRow + grid.y, totalRows)) * grid.h}px`
    }

    resize () {
        console.log('RESIZING')
        this.updateVisibleCards()

        // const sidebarCardsContainerObserver = new ResizeObserver(entries => {
        //     if (ELEMENTS.sidebarCardsContainer.totalCardCount == 0) { return }
            
        //     const newGrid = ELEMENTS.sidebarCardsContainer.getCardGrid()
        //     const x = newGrid.x
        //     const h = newGrid.h

        //     const paddingTop = parseFloat(window.getComputedStyle(ELEMENTS.sidebarCardsContainer).paddingTop)

        //     const newScroll = Math.floor((ELEMENTS.sidebarCardsContainer.firstVisibleCardIndex + x) / x) - 1 + ELEMENTS.sidebarCardsContainer.previousScrollDecimal

        //     ELEMENTS.sidebarCardsContainer.resizing = true
        //     ELEMENTS.sidebarCardsContainer.scrollTop = newScroll * h + paddingTop
        //     ELEMENTS.sidebarCardsContainer.hideCardsOptimization()
        // })
        // sidebarCardsContainerObserver.observe(ELEMENTS.sidebarCardsContainer)
    }

    scroll () {
        this.updateVisibleCards()
    }
}
customElements.define('card-container', CardContainer)