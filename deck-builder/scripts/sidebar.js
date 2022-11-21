sidebarCardContainer.additionalTopOffset = parseFloat(window.getComputedStyle(sidebarCardContainer).paddingTop)

sidebar.setTab = () => {
    if (window.innerWidth > window.innerHeight) {
        // document.getElementById("sidebar-tab").innerHTML = "◣◤"
    }
    else {
        // document.getElementById("sidebar-tab").innerHTML = "◢◣"
    }
}

sidebar.open = () => {
    sidebar.classList.add("open")
    mainPage.classList.add("half")
}

sidebar.close = () => {
    if (!sidebar.classList.contains("fullscreen")) {
        sidebar.classList.remove("open")
        mainPage.classList.remove("half")
    }
}

sidebar.mouseLeave = (event) => {
    if (event.x > 0 && event.y > 0 && event.x < window.innerWidth && event.y < window.innerHeight) {
        sidebar.close()
    }
}

sidebar.toggleFullscreen = () => {
    if (!sidebar.classList.contains("fullscreen")) {
        sidebar.classList.add("fullscreen")
        mainPage.classList.add("hidden")
    }
    else {
        sidebar.classList.remove("fullscreen")
        mainPage.classList.remove("hidden")
    }
}

sidebarNameInput.mouseEnter = () => {
    if (window.innerWidth > window.innerHeight) {
        filters.open()
    }
}

sidebarNameInput.mouseLeave = (event) => {
    if (event.x > 0 && event.y > 0 && event.x < window.innerWidth && event.y < window.innerHeight) {
        filters.close()
    }
}

sidebarCardContainer.scrollCards = () => {
    const hoveredCard = document.getElementsByClassName('hovered-card')[0]
    if (hoveredCard) { hoveredCard.unhover() }
    sidebarCardContainer.hideCardsOptimization()

    if (sidebarCardContainer.previousScrollTop && sidebarCardContainer.previousScrollTop < sidebarCardContainer.scrollTop && sidebarCardContainer.scrollTop - parseFloat(window.getComputedStyle(sidebarCardContainer).paddingTop) + 4 > 0) {
        sidebarNameInput.classList.add('hidden')
        sidebarCardContainer.additionalTopOffset = 0
    }
    else if (sidebarNameInput.classList.contains('hidden')) {
        sidebarNameInput.classList.remove('hidden')
        sidebarCardContainer.additionalTopOffset = parseFloat(window.getComputedStyle(sidebarCardContainer).paddingTop)
    }
    sidebarCardContainer.previousScrollTop = sidebarCardContainer.scrollTop
}

sidebarCardContainer.addCards = async function (url) {
    const response = await fetchCards(url)
    const newCards = response["cards"]
    // const newCards = sortCards(response["cards"])
    let sidebarCards = Array.from(sidebarCardContainer.getElementsByTagName("pokemon-card"))

    //if no cards have been added, create templates for all
    if (sidebarCards.length == 0) {
        for (let i = 0; i < response.totalCardCount; i++) {
            const card = document.createElement("pokemon-card")
            card.classList.add("hidden-card")
            sidebarCardContainer.insertBefore(card, document.getElementById("sidebar-card-spacer-bottom"));
        }
        sidebarCards = Array.from(sidebarCardContainer.getElementsByTagName("pokemon-card")) //update sidebarCards
    }

    //set card data
    for (let i = 0, startingIndex = response.pageSize * (response.page - 1); i < newCards.length; i++) {
        const card = sidebarCards[startingIndex + i]
        card.setData(newCards[i])
        // card.addTooltip("Right Click to Add to Deck")
    }
    
    sidebarCardContainer.hideCardsOptimization()

    if(response["totalCardCount"] > response["page"] * response["pageSize"]) {
        setTimeout(() => {
            sidebarCardContainer.addCards(url.split("page=")[0] + `page=${response["page"] + 1}`)
        }, 5000)
    }
}

//TEMPORARY

// sidebarCardContainer.addCards("https://api.pokemontcg.io/v2/cards?orderBy=set.releaseDate,number&q=(set.id:ex3)&page=1")
// sidebarCardContainer.addCards("https://api.pokemontcg.io/v2/cards?orderBy=set.releaseDate,number&q=(set.id:ex6)&page=1")
// sidebarCardContainer.addCards("https://api.pokemontcg.io/v2/cards?orderBy=set.releaseDate,number&q=(set.id:bw11+OR+set.id:bw10+OR+set.id:bw9+OR+set.id:bw8+OR+set.id:bw7+OR+set.id:dv1+OR+set.id:bw6+OR+set.id:bw5+OR+set.id:bw4+OR+set.id:bw3+OR+set.id:bw2+OR+set.id:bw1)+&page=1")
// sidebarCardContainer.addCards("https://api.pokemontcg.io/v2/cards?orderBy=set.releaseDate,number&q=(legalities.standard:legal)&page=1")
// sidebarCardContainer.addCards("https://api.pokemontcg.io/v2/cards?orderBy=set.releaseDate,number&q=(name:*)&page=1")
sidebarCardContainer.addCards("https://api.pokemontcg.io/v2/cards?orderBy=set.releaseDate,number&q=(set.id:swshp)&page=1")

sidebarCardContainer.getCardGrid = () => {
    const containerStyle = window.getComputedStyle(sidebarCardContainer)
    const containerWidth = sidebarCardContainer.offsetWidth - parseFloat(containerStyle.paddingLeft) - parseFloat(containerStyle.paddingRight)
    const minCardWidth = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--min-card-width'))
    const sidebarCardSize = document.getElementById("sidebar-card-size-reference").getBoundingClientRect()

    const x = Math.floor(containerWidth / minCardWidth)
    const w = sidebarCardSize.width
    const h = sidebarCardSize.height
    const y = Math.ceil(window.innerHeight / h) + 1
    
    // console.log(`sidebarCardContainer.getCardGrid x: ${x}, y: ${y}, w: ${w}, h: ${h}`)
    return {x, y, w, h}
}

//hide non-visible cards
sidebarCardContainer.hideCardsOptimization = () => {
    const {x, y, w, h} = sidebarCardContainer.getCardGrid()

    const containerStyle = window.getComputedStyle(sidebarCardContainer)
    const scrollPos = sidebarCardContainer.scrollTop - parseFloat(containerStyle.paddingTop)
    const firstVisibleRow = Math.max(0, Math.floor(scrollPos / h))

    const cards = Array.from(sidebarCardContainer.getElementsByTagName("pokemon-card"))
    for (let i = 0; i < Math.min(cards.length, firstVisibleRow * x); i++) {
        cards[i].classList.add("hidden-card")
    }

    document.getElementById("sidebar-card-spacer-top").style["height"] = `${firstVisibleRow * h}px`

    for (let i = firstVisibleRow * x; i < Math.min(cards.length, (firstVisibleRow + y) * x); i++) {
        cards[i].classList.remove("hidden-card")
    }

    for (let i = (firstVisibleRow + y) * x; i < cards.length; i++) {
        cards[i].classList.add("hidden-card")
    }

    const totalRows = Math.ceil(cards.length / x)
    document.getElementById("sidebar-card-spacer-bottom").style["height"] = `${(totalRows - Math.min(firstVisibleRow + y, totalRows)) * h}px`
}