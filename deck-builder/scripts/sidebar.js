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
ELEMENTS.sidebarCardsContainer.additionalLeftOffset = -8

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
    const url = `https://api.pokemontcg.io/v2/cards?orderBy=subtypes,name,set.releaseDate,set.id,number&q=${query}&page=1`

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

ELEMENTS.sidebarCardsContainer.fetchCards = async function (url, clearCards, incrementQueue) {

    if (incrementQueue == true) { ELEMENTS.sidebarCardsContainer.queueNumber++ }
    let queueNumber = ELEMENTS.sidebarCardsContainer.queueNumber

    const response = await API.fetchCards(url)

    if (response == 404 || response == 400) { return }

    if (queueNumber != ELEMENTS.sidebarCardsContainer.queueNumber) { return }

    if (clearCards == true) { ELEMENTS.sidebarCardsContainer.clearCards() }

    // if no cards have been added, create templates for all
    if (ELEMENTS.sidebarCardsContainer.cards.length == 0) {
        for (let i = 0; i < response.totalCardCount; i++) {
            const newCard = document.createElement('pokemon-card')
            newCard.classList.add('hidden-card')
            ELEMENTS.sidebarCardsContainer.addCard(newCard)
            newCard.setData(null, {
                'url': response.url.split('page=')[0] + `page=${Math.floor(i / response.pageSize) + 1}`,
                'index': i % response.pageSize
            })
        }
    }

    //set card data for cards that match url
    GLOBAL.setDataFromResponse(response)

    ELEMENTS.sidebarCardsContainer.updateVisibleCards()
}

//TEMPORARY
// ELEMENTS.sidebarCardsContainer.fetchCards("https://api.pokemontcg.io/v2/cards?orderBy=set.releaseDate,set.id,number&q=set.id:ex3+OR+set.id:ex6&page=1")
// ELEMENTS.sidebarCardsContainer.fetchCards("https://api.pokemontcg.io/v2/cards?orderBy=set.releaseDate,set.id,number&q=(set.id:bw11+OR+set.id:bw10+OR+set.id:bw9+OR+set.id:bw8+OR+set.id:bw7+OR+set.id:dv1+OR+set.id:bw6+OR+set.id:bw5+OR+set.id:bw4+OR+set.id:bw3+OR+set.id:bw2+OR+set.id:bw1)+&page=1")
// ELEMENTS.sidebarCardsContainer.fetchCards("https://api.pokemontcg.io/v2/cards?orderBy=set.releaseDate,set.id,number&q=(legalities.standard:legal)&page=1")
// ELEMENTS.sidebarCardsContainer.fetchCards("https://api.pokemontcg.io/v2/cards?orderBy=nationalPokedexNumbers,set.releaseDate,number&q=(supertype:%22Pok%C3%A9mon%22)+(subtypes:%22Stage%202%22)&page=1")
// ELEMENTS.sidebarCardsContainer.fetchCards("https://api.pokemontcg.io/v2/cards?orderBy=nationalPokedexNumbers,name,set.releaseDate&q=(set.series:%22Sword%20%26%20Shield%22)&page=1")
ELEMENTS.sidebarCardsContainer.fetchCards("https://api.pokemontcg.io/v2/cards?orderBy=nationalPokedexNumbers,set.releaseDate,number&q=-types:darkness+(attacks.cost:darkness)&page=1")