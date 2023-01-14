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
    sidebar.classList.remove("open")
    mainPage.classList.remove("half")
    sidebarTab.classList.remove('hidden')
    sidebarTopContainer.classList.remove('hidden')
}

sidebar.mouseLeave = (event) => {
    if (event.x > 0 && event.y > 0 && event.x < window.innerWidth && event.y < window.innerHeight && !focused.contains(document.elementFromPoint(event.x, event.y))) {
        sidebar.close()
    }
}

sidebar.toggleFullscreen = () => {
    if (!sidebar.classList.contains("fullscreen")) {
        sidebar.classList.add("fullscreen")
        filters.classList.add("fullscreen")
        mainPage.classList.add("hidden")
    }
    else {
        sidebar.classList.remove("fullscreen")
        filters.classList.remove("fullscreen")
        mainPage.classList.remove("hidden")
    }
}

sidebarTopContainer.mouseEnter = () => {
    if (window.innerWidth > window.innerHeight) {
        filters.open()
    }
}

sidebarTopContainer.mouseLeave = (event) => {
    if (event.x > 0 && event.y > 0 && event.x < window.innerWidth && event.y < window.innerHeight) {
        filters.close()
    }
}

sidebarTopFullscreenButton.click = () => {
    sidebar.toggleFullscreen()
}

sidebarCardsContainer.searchTimeout = false
sidebarCardsContainer.queuedUrl = null


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

    if (search['filters'].length == 0) { //Check for empty search
        sidebarCardsContainer.clearCards()
        sidebarCardsContainer.queueNumber++
        sidebarCardsContainer.currentSearch = {}
        return
    }

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

    // FILTERS COMPLETED, SAVE SEARCH

    if (Object.keys(search).length == 0 || (search['filters'] && search['filters'].length == 0)) { //Check for empty search
        sidebarCardsContainer.clearCards()
        sidebarCardsContainer.queueNumber++
        sidebarCardsContainer.currentSearch = {}
        return
    }

    if (JSON.stringify(search) == JSON.stringify(sidebarCardsContainer.currentSearch)) {
        return
    }

    sidebarCardsContainer.currentSearch = {}
    Object.assign(sidebarCardsContainer.currentSearch, search)
    // console.log(sidebarCardsContainer.currentSearch)

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

    const url = `https://api.pokemontcg.io/v2/cards?orderBy=set.releaseDate,set.id,number&q=${query}&page=1`

    if (sidebarCardsContainer.searchTimeout == true) { sidebarCardsContainer.queuedUrl = url }
    else {
        sidebarCardsContainer.fetchCards(url, true, true)
        sidebarCardsContainer.searchTimeout = true
        setTimeout(() => {
            sidebarCardsContainer.searchTimeout = false
            if (sidebarCardsContainer.queuedUrl) {
                sidebarCardsContainer.fetchCards(sidebarCardsContainer.queuedUrl, true, true)
                sidebarCardsContainer.queuedUrl = undefined
            }
        }, 1500);
    }
}

sidebarCardsContainer.clearCards = () => {
    const cards = sidebarCardsContainer.getElementsByTagName("pokemon-card")
    while (cards.length > 0) {
        sidebarCardsContainer.removeChild(cards[0])
    }
    sidebarCardsContainer.scrollTop = 0
    sidebarCardsContainer.fetchedPages = []
    sidebarCardsContainer.totalCardCount = 0
}

sidebarCardsContainer.fetchCards = async function (url, clearCards, incrementQueue) {

    if (incrementQueue == true) { sidebarCardsContainer.queueNumber++ }
    let queueNumber = sidebarCardsContainer.queueNumber

    sidebarCardsContainer.fetchedPages.push(url.split('page=')[1])
    const response = await fetchCards(url)

    if (response == 404) {
        // setTimeout(() => {
        //     sidebarCardsContainer.fetchCards(url, clearCards, false)
        // }, 1000);
        return
    }
    else if (response == 400) { return }

    if (queueNumber != sidebarCardsContainer.queueNumber) { return }

    if (clearCards == true) { sidebarCardsContainer.clearCards() }

    sidebarCardsContainer.addCards(response)
}

sidebarCardsContainer.addCards = (data) => {
    let sidebarCards = Array.from(sidebarCardsContainer.getElementsByTagName("pokemon-card"))

    const cards = data["cards"]

    //if no cards have been added, create templates for all
    if (sidebarCards.length == 0) {
        sidebarCardsContainer.totalCardCount = data.totalCardCount
        sidebarCardsContainer.firstVisibleCardIndex = 0

        for (let i = 0; i < data.totalCardCount; i++) {
            const card = document.createElement("pokemon-card")
            card.classList.add("hidden-card")
            card.dataUrl = data["url"].split("page=")[0] + `page=${Math.floor(i / data["pageSize"]) + 1}`
            sidebarCardsContainer.insertBefore(card, document.getElementById("sidebar-cards-spacer-bottom"));
        }
        sidebarCards = Array.from(sidebarCardsContainer.getElementsByTagName("pokemon-card")) //update sidebarCards
    }

    //set card data
    for (let i = 0, startingIndex = data.pageSize * (data.page - 1); i < cards.length; i++) {
        const card = sidebarCards[startingIndex + i]
        card.setData(cards[i])
    }
    
    sidebarCardsContainer.hideCardsOptimization()
}

//TEMPORARY
// sidebarCardsContainer.fetchCards("https://api.pokemontcg.io/v2/cards?orderBy=set.releaseDate,set.id,number&q=set.id:ex3+OR+set.id:ex6&page=1")
// sidebarCardsContainer.fetchCards("https://api.pokemontcg.io/v2/cards?orderBy=set.releaseDate,set.id,number&q=(set.id:bw11+OR+set.id:bw10+OR+set.id:bw9+OR+set.id:bw8+OR+set.id:bw7+OR+set.id:dv1+OR+set.id:bw6+OR+set.id:bw5+OR+set.id:bw4+OR+set.id:bw3+OR+set.id:bw2+OR+set.id:bw1)+&page=1")
// sidebarCardsContainer.fetchCards("https://api.pokemontcg.io/v2/cards?orderBy=set.releaseDate,set.id,number&q=(legalities.standard:legal)&page=1")
sidebarCardsContainer.fetchCards("https://api.pokemontcg.io/v2/cards?orderBy=set.releaseDate,set.id,number&q=(set.series:%22Sword%20%26%20Shield%22)&page=1")

sidebarCardsContainer.getCardGrid = () => {
    const columns = getComputedStyle(sidebarCardsContainer).gridTemplateColumns.split(' ')

    const x = columns.length
    const w = parseFloat(columns[0])

    const h = w * 8.8 / 6.3
    const y = Math.ceil(sidebarCardsContainer.clientHeight / h) + 1

    // console.log(`sidebarCardsContainer.getCardGrid x: ${x}, y: ${y}, w: ${w}, h: ${h}`)
    return {x, y, w, h}
}



sidebarCardsContainer.scrollCards = () => {
    const hoveredCard = document.getElementsByClassName('hovered-card')[0]
    if (hoveredCard) { hoveredCard.unhover() }

    if (sidebarCardsContainer.resizing == true) {
        sidebarCardsContainer.resizing = false
        return
    }

    if (sidebarCardsContainer.previousScrollTop && sidebarCardsContainer.previousScrollTop < sidebarCardsContainer.scrollTop && sidebarCardsContainer.scrollTop - parseFloat(window.getComputedStyle(sidebarCardsContainer).paddingTop) + 4 > 0) {
        sidebarTab.classList.add('hidden')
        sidebarTopContainer.classList.add('hidden')
        sidebarCardsContainer.additionalTopOffset = parseFloat(window.getComputedStyle(sidebarCardsContainer).paddingTop)
    }
    else if (sidebarTopContainer.classList.contains('hidden')) {
        sidebarTab.classList.remove('hidden')
        sidebarTopContainer.classList.remove('hidden')
        sidebarCardsContainer.additionalTopOffset = null
    }

    sidebarCardsContainer.hideCardsOptimization()
    sidebarCardsContainer.previousScrollTop = sidebarCardsContainer.scrollTop

    const newGrid = sidebarCardsContainer.getCardGrid()
    const x = newGrid.x
    const h = newGrid.h

    const paddingTop = parseFloat(window.getComputedStyle(sidebarCardsContainer).paddingTop)

    const cards = Array.from(sidebarCardsContainer.getElementsByTagName("pokemon-card"))
    const totalRows = Math.ceil(cards.length / x)

    const previousScroll = totalRows * (sidebarCardsContainer.scrollTop - paddingTop) / (sidebarCardsContainer.scrollHeight - paddingTop)
    sidebarCardsContainer.previousScrollDecimal = previousScroll - Math.floor(previousScroll)

    const scrollPos = sidebarCardsContainer.scrollTop - paddingTop
    const firstVisibleRow = Math.max(0, Math.floor(scrollPos / h))

    sidebarCardsContainer.firstVisibleCardIndex = firstVisibleRow * x
}



//hide non-visible cards
sidebarCardsContainer.hideCardsOptimization = () => {
    if (sidebarCardsContainer.totalCardCount == 0) { return }

    const newGrid = sidebarCardsContainer.getCardGrid()
    const x = newGrid.x
    const y = newGrid.y
    const h = newGrid.h
    const cards = Array.from(sidebarCardsContainer.getElementsByTagName("pokemon-card"))
    const totalRows = Math.ceil(cards.length / x)
    const paddingTop = parseFloat(window.getComputedStyle(sidebarCardsContainer).paddingTop)
    const scrollPos = sidebarCardsContainer.scrollTop - paddingTop
    const firstVisibleRow = Math.max(0, Math.floor(scrollPos / h))

    for (let i = 0; i < Math.min(cards.length, firstVisibleRow * x); i++) {
        cards[i].classList.add("hidden-card")
    }

    document.getElementById("sidebar-cards-spacer-top").style["height"] = `${firstVisibleRow * h}px`

    for (let i = firstVisibleRow * x; i < Math.min(cards.length, (firstVisibleRow + y) * x); i++) {
        cards[i].classList.remove("hidden-card")
        if (!cards[i].data && !sidebarCardsContainer.fetchedPages.includes(cards[i].dataUrl.split("page=")[1])) {
            sidebarCardsContainer.fetchCards(cards[i].dataUrl)
        }
    }

    for (let i = (firstVisibleRow + y) * x; i < cards.length; i++) {
        cards[i].classList.add("hidden-card")
    }

    document.getElementById("sidebar-cards-spacer-bottom").style["height"] = `${(totalRows - Math.min(firstVisibleRow + y, totalRows)) * h}px`
}



const sidebarCardsContainerObserver = new ResizeObserver(entries => {
    if (sidebarCardsContainer.totalCardCount == 0) { return }
    
    const newGrid = sidebarCardsContainer.getCardGrid()
    const x = newGrid.x
    const h = newGrid.h

    const paddingTop = parseFloat(window.getComputedStyle(sidebarCardsContainer).paddingTop)

    const newScroll = Math.floor((sidebarCardsContainer.firstVisibleCardIndex + x) / x) - 1 + sidebarCardsContainer.previousScrollDecimal

    sidebarCardsContainer.resizing = true
    sidebarCardsContainer.scrollTop = newScroll * h + paddingTop
    sidebarCardsContainer.hideCardsOptimization()
})
sidebarCardsContainerObserver.observe(sidebarCardsContainer)
