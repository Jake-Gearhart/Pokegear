ELEMENTS.sidebar.setTab = () => {
    if (window.innerWidth > window.innerHeight) {
        // document.getElementById("sidebar-tab").innerHTML = "◣◤"
    }
    else {
        // document.getElementById("sidebar-tab").innerHTML = "◢◣"
    }
}

ELEMENTS.sidebar.open = () => {
    ELEMENTS.sidebar.classList.add("open")
    ELEMENTS.mainPage.classList.add("half")
}

ELEMENTS.sidebar.close = () => {
    ELEMENTS.sidebar.classList.remove("open")
    ELEMENTS.mainPage.classList.remove("half")
    ELEMENTS.sidebarTab.classList.remove('hidden')
    ELEMENTS.sidebarTopContainer.classList.remove('hidden')
}

ELEMENTS.sidebar.mouseLeave = (event) => {
    if (!ELEMENTS.sidebar.classList.contains("fullscreen") && event.x > 0 && event.y > 0 && event.x < window.innerWidth && event.y < window.innerHeight && !focused.contains(document.elementFromPoint(event.x, event.y))) {
        ELEMENTS.sidebar.close()
    }
}

ELEMENTS.sidebar.toggleFullscreen = () => {
    if (!ELEMENTS.sidebar.classList.contains("fullscreen")) {
        ELEMENTS.sidebar.classList.add("fullscreen")
        ELEMENTS.filters.classList.add("fullscreen")
        ELEMENTS.mainPage.classList.add("hidden")
    }
    else {
        ELEMENTS.sidebar.classList.remove("fullscreen")
        ELEMENTS.filters.classList.remove("fullscreen")
        ELEMENTS.mainPage.classList.remove("hidden")
    }
}

ELEMENTS.sidebarTopContainer.mouseEnter = () => {
    if (window.innerWidth > window.innerHeight) {
        ELEMENTS.filters.open()
    }
}

ELEMENTS.sidebarTopContainer.mouseLeave = (event) => {
    if (event.x > 0 && event.y > 0 && event.x < window.innerWidth && event.y < window.innerHeight) {
        ELEMENTS.filters.close()
    }
}

ELEMENTS.sidebarTopFullscreenButton.click = () => {
    ELEMENTS.sidebar.toggleFullscreen()
}

ELEMENTS.sidebarCardsContainer.searchTimeout = false
ELEMENTS.sidebarCardsContainer.queuedUrl = null


function getSidebarCards (executor) {
    if (executor) {
        if (executor.getAttribute('number') == 'true') {
            executor.value = executor.value.replace(/[^0-9/!*]/g, '')
        }
        else {
            executor.value = executor.value.replace(/[^A-Za-z0-9\s/'"´é!*-]/g, '')
        }
    }

    const search = {
        'conjunction': 'and', 
        'filters': []
    }

    const searchTermElms = Array.from(document.getElementsByClassName('searchTerm'))
    for (let i = 0; i < searchTermElms.length; i++) {
        let value = searchTermElms[i].value.trim()

        if (value.length == 0) { continue }

        search['filters'].push({
            'searchterms': searchTermElms[i].getAttribute('searchterms').split(' '),
            'value': value,
            'strict': searchTermElms[i].getAttribute('strict') == 'false' ? false : true,
            'quotes': searchTermElms[i].getAttribute('quotes') == 'false' ? false : true
        })
    }

    // if (search['filters'].length == 0) { //Check for empty search
    //     ELEMENTS.sidebarCardsContainer.clearCards()
    //     ELEMENTS.sidebarCardsContainer.queueNumber++
    //     ELEMENTS.sidebarCardsContainer.currentSearch = {}
    //     return
    // }

    if (search['filters'].length > 0) {
        function filter(elm) {
            // SPLIT MULTIPLE SEARCH TERMS
            if (elm['searchterms']) {
                if (elm['searchterms'].length == 1) {
                    elm['term'] = elm['searchterms'][0]
                }
                else {
                    elm['conjunction'] = 'or'
                    elm['filters'] = []
                    for (let i = 0; i < elm['searchterms'].length; i++) {
                        elm['filters'].push({
                            'term': elm['searchterms'][i],
                            'value': elm['value'].trim(),
                            'strict': elm['strict'],
                            'quotes': elm['quotes']
                        })
                    }
                    delete elm['value']
                    delete elm['strict']
                    delete elm['quotes']
                }
                delete elm['searchterms']
            }
            // SPLIT OR GROUPS
            if (elm['value'] && elm['value'].includes('/')) {
                let orGroups = elm['value'].split('/')
                elm['conjunction'] = 'or'
                elm['filters'] = []
                for (let i = 0; i < orGroups.length; i++) {
                    const orGroup = orGroups[i].trim()
                    if (orGroup.length == 0) { continue }
                    elm['filters'].push({
                        'term': elm['term'],
                        'value': orGroup,
                        'strict': elm['strict'],
                        'quotes': elm['quotes']
                    })
                }
                delete elm['term']
                delete elm['value']
                delete elm['strict']
                delete elm['quotes']
            }
            // SPLIT AND GROUPS
            if (elm['value'] && elm['value'].includes('"')) {
                let andGroups = elm['value'].split('"')
                elm['conjunction'] = 'and'
                elm['filters'] = []
                for (let i = 0; i < andGroups.length; i++) {
                    const andGroup = andGroups[i].trim()
                    if (andGroup.length == 0) { continue }
                    elm['filters'].push({
                        'term': elm['term'],
                        'value': andGroup,
                        'strict': i % 2 == 0 ? false : true,
                        'quotes': elm['quotes']
                    })
                }
                delete elm['term']
                delete elm['value']
                delete elm['strict']
                delete elm['quotes']
            }
            // SPLIT SPACE GROUPS
            if (elm['value'] && elm['value'].includes(' ') && elm['strict'] == false) {
                let andGroups = elm['value'].split(' ')
                elm['conjunction'] = 'and'
                elm['filters'] = []
                for (let i = 0; i < andGroups.length; i++) {
                    const andGroup = andGroups[i].trim()
                    if (andGroups.length == 0) { continue }
                    elm['filters'].push({
                        'term': elm['term'],
                        'value': andGroup,
                        'strict': elm['strict'],
                        'quotes': elm['quotes']
                    })
                }
                delete elm['term']
                delete elm['value']
                delete elm['strict']
                delete elm['quotes']
            }
            // ADD INVERTS
            if (elm['value']) {
                if (elm['value'][0] == '!') {
                    elm['value'] = elm['value'].slice(1)
                    elm['invert'] = true
                }
                else {
                    elm['invert'] = false
                }
            }
            if (elm['filters']) {
                for (let i = 0; i < elm['filters'].length; i++) {
                    filter(elm['filters'][i])
                }
            }
        }
        filter(search)

        // COMPRESS
        function compress(elm) {
            if (elm['filters'] && elm['filters'].length == 1) {
                const filterCopy = elm['filters'][0]
                delete elm['filters']
                delete elm['conjunction']
                Object.assign(elm, filterCopy)
                if (filterCopy['filters']) { compress(elm) }
            }
            if (elm['filters']) {
                for (let i = 0; i < elm['filters'].length; i++) {
                    compress(elm['filters'][i])
                }
            }
        }
        compress(search)
    }

    // FILTERS COMPLETED, SAVE SEARCH

    let includeFavorites = false
    if (ELEMENTS.filterCardFavoritesButton.enabled) { includeFavorites = true }

    if ((Object.keys(search).length == 0 || (search['filters'] && search['filters'].length == 0)) && includeFavorites == false) { //Check for empty search
        ELEMENTS.sidebarCardsContainer.clearCards()
        ELEMENTS.sidebarCardsContainer.queueNumber++
        ELEMENTS.sidebarCardsContainer.currentSearch = {}
        return
    }

    // if (JSON.stringify(search) == JSON.stringify(ELEMENTS.sidebarCardsContainer.currentSearch)) {
    //     return
    // }

    ELEMENTS.sidebarCardsContainer.currentSearch = {}
    Object.assign(ELEMENTS.sidebarCardsContainer.currentSearch, search)
    // console.log(ELEMENTS.sidebarCardsContainer.currentSearch)

    let query = ''
    function queryConstructor(elm) {
        if (elm['filters']) {
            query += '('
            for (let i = 0; i < elm['filters'].length; i++) {
                queryConstructor(elm['filters'][i])
                if (i + 1 < elm['filters'].length) {
                    if (elm['conjunction'] == 'or') { query += '+OR+' }
                    else { query += '+' }
                }
            }
            query += ')'
        }
        else {
            let newTerm = elm['term'] + ':'
            if (elm['invert'] == true) { newTerm = '-' + newTerm }

            let newValue = elm['value'].replaceAll(' ', '%20').replaceAll('\'', '%27')
            if (elm['strict'] == false) { newValue = '*' + newValue + '*' }
            if (elm['quotes'] == true) { newValue = '%22' + newValue + '%22' }

            query += newTerm + newValue
        }
    }
    queryConstructor(search)

    //HERE HERE HERE HERE HERE
    if (includeFavorites == true) {
        if (query != '()') {
            query += `+(id:${GLOBAL.localStorage['deck-builder']['favorite-card-ids'].join('+OR+id:')})`
        }
        else {
            query = `id:${GLOBAL.localStorage['deck-builder']['favorite-card-ids'].join('+OR+id:')}`
        }
    }

    // const url = `https://api.pokemontcg.io/v2/cards?orderBy=set.releaseDate,set.id,number&q=${query}&page=1`
    const url = `https://api.pokemontcg.io/v2/cards?orderBy=nationalPokedexNumbers,set.releaseDate,set.id,number&q=${query}&page=1`

    if (ELEMENTS.sidebarCardsContainer.searchTimeout == true) { ELEMENTS.sidebarCardsContainer.queuedUrl = url }
    else {
        ELEMENTS.sidebarCardsContainer.fetchCards(url, true, true)
        ELEMENTS.sidebarCardsContainer.searchTimeout = true
        setTimeout(() => {
            ELEMENTS.sidebarCardsContainer.searchTimeout = false
            if (ELEMENTS.sidebarCardsContainer.queuedUrl) {
                ELEMENTS.sidebarCardsContainer.fetchCards(ELEMENTS.sidebarCardsContainer.queuedUrl, true, true)
                ELEMENTS.sidebarCardsContainer.queuedUrl = undefined
            }
        }, 1500);
    }
}

ELEMENTS.sidebarCardsContainer.clearCards = () => {
    ELEMENTS.sidebarCardsContainer.innerHTML = '<div id="sidebar-cards-spacer-top"></div><div id="sidebar-cards-spacer-bottom"></div>'
    ELEMENTS.sidebarCardsContainer.scrollTop = 0
    ELEMENTS.sidebarCardsContainer.fetchedPages = []
    ELEMENTS.sidebarCardsContainer.totalCardCount = 0
}

ELEMENTS.sidebarCardsContainer.fetchCards = async function (url, clearCards, incrementQueue) {

    if (incrementQueue == true) { ELEMENTS.sidebarCardsContainer.queueNumber++ }
    let queueNumber = ELEMENTS.sidebarCardsContainer.queueNumber

    ELEMENTS.sidebarCardsContainer.fetchedPages.push(url.split('page=')[1])
    const response = await fetchCards(url)

    if (response == 404) {
        // setTimeout(() => {
        //     ELEMENTS.sidebarCardsContainer.fetchCards(url, clearCards, false)
        // }, 1000);
        return
    }
    else if (response == 400) { return }

    if (queueNumber != ELEMENTS.sidebarCardsContainer.queueNumber) { return }

    if (clearCards == true) { ELEMENTS.sidebarCardsContainer.clearCards() }

    //TEMPORARY
    // response['totalCardCount'] += localCards.length
    // if (url.split('page=')[1] == Math.ceil(response['totalCardCount']/response['pageSize'])) {
    //     response['cards'].push(...localCards)
    // }

    ELEMENTS.sidebarCardsContainer.addCards(response)
}

ELEMENTS.sidebarCardsContainer.getCards = () => {
    return Array.from(ELEMENTS.sidebarCardsContainer.getElementsByTagName("pokemon-card"))
}

ELEMENTS.sidebarCardsContainer.addCards = (data) => {
    let sidebarCards = ELEMENTS.sidebarCardsContainer.getCards()
    const cards = data["cards"]

    //if no cards have been added, create templates for all
    if (sidebarCards.length == 0) {
        ELEMENTS.sidebarCardsContainer.totalCardCount = data.totalCardCount
        ELEMENTS.sidebarCardsContainer.firstVisibleCardIndex = 0

        for (let i = 0; i < data.totalCardCount; i++) {
            const card = document.createElement("pokemon-card")
            card.classList.add("hidden-card")
            card.dataUrl = data["url"].split("page=")[0] + `page=${Math.floor(i / data["pageSize"]) + 1}`
            ELEMENTS.sidebarCardsContainer.insertBefore(card, document.getElementById("sidebar-cards-spacer-bottom"));
        }
        sidebarCards = Array.from(ELEMENTS.sidebarCardsContainer.getElementsByTagName("pokemon-card")) //update sidebarCards
    }

    //set card data
    for (let i = 0, startingIndex = data.pageSize * (data.page - 1); i < cards.length; i++) {
        const card = sidebarCards[startingIndex + i]
        card.setData(cards[i])
    }
    
    ELEMENTS.sidebarCardsContainer.hideCardsOptimization()
}

//TEMPORARY
ELEMENTS.sidebarCardsContainer.fetchCards("https://api.pokemontcg.io/v2/cards?orderBy=set.releaseDate,set.id,number&q=set.id:ex3+OR+set.id:ex6&page=1")
// ELEMENTS.sidebarCardsContainer.fetchCards("https://api.pokemontcg.io/v2/cards?orderBy=set.releaseDate,set.id,number&q=(set.id:bw11+OR+set.id:bw10+OR+set.id:bw9+OR+set.id:bw8+OR+set.id:bw7+OR+set.id:dv1+OR+set.id:bw6+OR+set.id:bw5+OR+set.id:bw4+OR+set.id:bw3+OR+set.id:bw2+OR+set.id:bw1)+&page=1")
// ELEMENTS.sidebarCardsContainer.fetchCards("https://api.pokemontcg.io/v2/cards?orderBy=set.releaseDate,set.id,number&q=(legalities.standard:legal)&page=1")
// ELEMENTS.sidebarCardsContainer.fetchCards("https://api.pokemontcg.io/v2/cards?orderBy=set.releaseDate,set.id,number&q=(set.series:%22Sword%20%26%20Shield%22)&page=1")
// ELEMENTS.sidebarCardsContainer.fetchCards("https://api.pokemontcg.io/v2/cards?orderBy=nationalPokedexNumbers,set.releaseDate,number&q=(supertype:%22Pok%C3%A9mon%22)+(subtypes:%22Stage%202%22)&page=1")

ELEMENTS.sidebarCardsContainer.getCardGrid = () => {
    const columns = getComputedStyle(ELEMENTS.sidebarCardsContainer).gridTemplateColumns.split(' ')

    const x = columns.length
    const w = parseFloat(columns[0])

    const h = w * GLOBAL.cardHeight / GLOBAL.cardWidth
    const y = Math.ceil(ELEMENTS.sidebarCardsContainer.clientHeight / h) + 1

    // console.log(`ELEMENTS.sidebarCardsContainer.getCardGrid x: ${x}, y: ${y}, w: ${w}, h: ${h}`)
    return {x, y, w, h}
}



ELEMENTS.sidebarCardsContainer.scrollCards = () => {
    const hoveredCard = document.getElementsByClassName('hovered-card')[0]
    if (hoveredCard) { hoveredCard.unhover() }

    if (ELEMENTS.sidebarCardsContainer.resizing == true) {
        ELEMENTS.sidebarCardsContainer.resizing = false
        return
    }

    if (ELEMENTS.sidebarCardsContainer.previousScrollTop && ELEMENTS.sidebarCardsContainer.previousScrollTop < ELEMENTS.sidebarCardsContainer.scrollTop && ELEMENTS.sidebarCardsContainer.scrollTop - parseFloat(window.getComputedStyle(ELEMENTS.sidebarCardsContainer).paddingTop) + 4 > 0) {
        ELEMENTS.sidebarTab.classList.add('hidden')
        ELEMENTS.sidebarTopContainer.classList.add('hidden')
        ELEMENTS.sidebarCardsContainer.additionalTopOffset = parseFloat(window.getComputedStyle(ELEMENTS.sidebarCardsContainer).paddingTop)
    }
    else if (ELEMENTS.sidebarTopContainer.classList.contains('hidden')) {
        ELEMENTS.sidebarTab.classList.remove('hidden')
        ELEMENTS.sidebarTopContainer.classList.remove('hidden')
        ELEMENTS.sidebarCardsContainer.additionalTopOffset = null
    }

    ELEMENTS.sidebarCardsContainer.hideCardsOptimization()
    ELEMENTS.sidebarCardsContainer.previousScrollTop = ELEMENTS.sidebarCardsContainer.scrollTop

    const newGrid = ELEMENTS.sidebarCardsContainer.getCardGrid()
    const x = newGrid.x
    const h = newGrid.h

    const paddingTop = parseFloat(window.getComputedStyle(ELEMENTS.sidebarCardsContainer).paddingTop)

    const cards = Array.from(ELEMENTS.sidebarCardsContainer.getElementsByTagName("pokemon-card"))
    const totalRows = Math.ceil(cards.length / x)

    const previousScroll = totalRows * (ELEMENTS.sidebarCardsContainer.scrollTop - paddingTop) / (ELEMENTS.sidebarCardsContainer.scrollHeight - paddingTop)
    ELEMENTS.sidebarCardsContainer.previousScrollDecimal = previousScroll - Math.floor(previousScroll)

    const scrollPos = ELEMENTS.sidebarCardsContainer.scrollTop - paddingTop
    const firstVisibleRow = Math.max(0, Math.floor(scrollPos / h))

    ELEMENTS.sidebarCardsContainer.firstVisibleCardIndex = firstVisibleRow * x
}



//hide non-visible cards
ELEMENTS.sidebarCardsContainer.hideCardsOptimization = () => {
    if (ELEMENTS.sidebarCardsContainer.totalCardCount == 0) { return }

    const newGrid = ELEMENTS.sidebarCardsContainer.getCardGrid()
    const x = newGrid.x
    const y = newGrid.y
    const h = newGrid.h
    const cards = Array.from(ELEMENTS.sidebarCardsContainer.getElementsByTagName("pokemon-card"))
    const totalRows = Math.ceil(cards.length / x)
    const paddingTop = parseFloat(window.getComputedStyle(ELEMENTS.sidebarCardsContainer).paddingTop)
    const scrollPos = ELEMENTS.sidebarCardsContainer.scrollTop - paddingTop
    const firstVisibleRow = Math.max(0, Math.floor(scrollPos / h))

    for (let i = 0; i < Math.min(cards.length, firstVisibleRow * x); i++) {
        cards[i].classList.add("hidden-card")
    }

    document.getElementById("sidebar-cards-spacer-top").style["height"] = `${firstVisibleRow * h}px`

    for (let i = firstVisibleRow * x; i < Math.min(cards.length, (firstVisibleRow + y) * x); i++) {
        cards[i].classList.remove("hidden-card")
        if (!cards[i].data && !ELEMENTS.sidebarCardsContainer.fetchedPages.includes(cards[i].dataUrl.split("page=")[1])) {
            ELEMENTS.sidebarCardsContainer.fetchCards(cards[i].dataUrl)
        }
    }

    for (let i = (firstVisibleRow + y) * x; i < cards.length; i++) {
        cards[i].classList.add("hidden-card")
    }

    document.getElementById("sidebar-cards-spacer-bottom").style["height"] = `${(totalRows - Math.min(firstVisibleRow + y, totalRows)) * h}px`
}



const sidebarCardsContainerObserver = new ResizeObserver(entries => {
    if (ELEMENTS.sidebarCardsContainer.totalCardCount == 0) { return }
    
    const newGrid = ELEMENTS.sidebarCardsContainer.getCardGrid()
    const x = newGrid.x
    const h = newGrid.h

    const paddingTop = parseFloat(window.getComputedStyle(ELEMENTS.sidebarCardsContainer).paddingTop)

    const newScroll = Math.floor((ELEMENTS.sidebarCardsContainer.firstVisibleCardIndex + x) / x) - 1 + ELEMENTS.sidebarCardsContainer.previousScrollDecimal

    ELEMENTS.sidebarCardsContainer.resizing = true
    ELEMENTS.sidebarCardsContainer.scrollTop = newScroll * h + paddingTop
    ELEMENTS.sidebarCardsContainer.hideCardsOptimization()
})
sidebarCardsContainerObserver.observe(ELEMENTS.sidebarCardsContainer)