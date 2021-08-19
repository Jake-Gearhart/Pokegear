//SETUP –––––––– SETUP –––––––– SETUP –––––––– SETUP –––––––– SETUP –––––––– SETUP –––––––– SETUP –––––––– SETUP –––––––– SETUP –––––––– SETUP –––––––– SETUP –––––––– SETUP –––––––– SETUP –––––––– SETUP –––––––– SETUP –––––––– SETUP

var windowHeight = window.innerHeight
var windowWidth = window.innerWidth

//logs
var logs = []

const holoRarities = [
    'Amazing Rare',
    'LEGEND',
    'Rare ACE',
    'Rare BREAK',
    'Rare Holo',
    'Rare Holo EX',
    'Rare Holo GX',
    'Rare Holo LV.X',
    'Rare Holo Star',
    'Rare Holo V',
    'Rare Holo VMAX',
    'Rare Prime',
    'Rare Prism Star',
    'Rare Rainbow',
    'Rare Secret',
    'Rare Shining',
    'Rare Shiny',
    'Rare Shiny GX',
    'Rare Ultra'
]
const urlTranslations = {
    'é': '%C3%A9',
    '◇': '%E2%97%87',
    '◊': '%E2%97%87',
    'prism star': '%E2%97%87',
    'delta': '%CE%B4'
}

//sidebar
const sidebarDiv = document.getElementById('sidebar')
const sidebarCards = document.getElementById('sidebarCards');
const parameterButtonsDiv = document.getElementById('parameterButtons')
var checkparameterButtonsHover

//deck
const deckCards = document.getElementById('deckCards')
const deckCardCount = document.getElementById('deckCardCount')
var isDeckLocked = false

//focused card
var currentFocused
var currentFetchID = 0
const priceDataTranslations = {
    'normal': 'Regular',
    'holofoil': 'Holo',
    'reverseHolofoil': 'Reverse Holo',
    '1stEditionHolofoil': '1st Edition Holo',
    '1stEditionNormal': '1st Edition'
}

//search variables
var previousSearch
var cooldown = false
var queuedSearch = false
var loadingMoreCards = false

//loading queue
var loadingQueue = 0

//import deck variables
var basicEnergies = {
    'grass': ['evo', '91'],
    'fire': ['evo', '92'],
    'water': ['evo', '93'],
    'lightning': ['evo', '94'],
    'psychic': ['evo', '95'],
    'fighting': ['evo', '96'],
    'darkness': ['evo', '97'],
    'metal': ['evo', '98'],
    'fairy': ['evo', '99']
}
var setIdTranslations = {
    'shf': 'swsh45',
    'si': 'si1',
    'wbsp': 'basep',
    'bs2': 'base4',
    'exp': 'ecard1',
    'e1': 'ecard1',
    'aqp': 'ecard2',
    'e2': 'ecard2',
    'skr': 'ecard3',
    'e3': 'ecard3',
    'p1': 'pop1',
    'p2': 'pop2',
    'p3': 'pop3',
    'p4': 'pop4',
    'p5': 'pop5',
    'p6': 'pop6',
    'p7': 'pop7',
    'p8': 'pop8',
    'p9': 'pop9'
}

var ptcgoCodeTranslations = {
    'EX': 'EXP',
    'AQ': 'AQP',
    'SK': 'SKR'
}

//add event listeners
document.addEventListener('keydown', e => {
    if (currentFocused && (event.keyCode == 39 || event.keyCode == 68)) {
        //left arrow, D key
        event.preventDefault()
        cycleFocused('right')
    }
    else if (currentFocused && (event.keyCode == 37 || event.keyCode == 65)) {
        //right arrow, A key
        event.preventDefault()
        cycleFocused('left')
    }
    else if (document.getElementById('focused') && (event.keyCode == 27)) {
        // escape
        animateRemoveElement(document.getElementById('focused'), 'fadeOut'); 
        currentFocused = null
    }
});
document.addEventListener('mousemove', e => {
    var hoveredCards = document.getElementsByClassName('hoveredCard')
    for (i=0; i<hoveredCards.length; i++) {
        // if mouse not over card and not over a hover menu button
        if (e.target != hoveredCards[i] && e.target.parentNode.parentNode != hoveredCards[i]) {
            cardUnhover(hoveredCards[i])
        }
    }
});
document.addEventListener("dragover", e => {
    e.preventDefault()
});
document.addEventListener('drop', e => {
    e.preventDefault()
    if (isDeckLocked == false) {
        var inputFiles = e['dataTransfer']['files']
        for (i=0; i<inputFiles.length; i++) {
            var fileReader = new FileReader()
            fileReader.filename = 'custom-card-' + inputFiles[i]['name']
            fileReader.onload = function (event) {
                addDeckCard(createCard({
                    'id': fileReader['filename'],
                    'name': fileReader['filename'],
                    'custom-card': true,
                    'images': {'small': fileReader['result']}
                }), +1)
            }
            fileReader.readAsDataURL(inputFiles[i])
        }
    }
    else {
        LOG_alertNormal('The deck is locked!')
    }
})

//populate sets
var setsLoaded = false
populateSets()
async function populateSets () {
    var url = 'https://api.pokemontcg.io/v2/sets?orderBy=-releaseDate'
    loadingAlertStart(url)
    var response
    var json
    try {
        response = await fetch(url)
        json = await response.json()
        loadingAlertEnd(url, true)
    }
    catch {
        loadingAlertEnd(url, false)
        return
    }

    // RIGHT SIDE
    var rightButtons = parameterButtonsDiv.appendChild(createElement('div', null, {'id': 'rightButtons', 'class': 'parameterButtonsSubContainer', 'style': 'right: 0;'}))

    var sets = json['data']
    var combinationButtons = {}
    for (i=0; i<sets.length; i++) {
        var set = sets[i]
        var reverseSet = sets[sets.length -1 -i]
        if (set['ptcgoCode'] && !setIdTranslations[set['ptcgoCode'].toLowerCase()]) {
            setIdTranslations[set['ptcgoCode'].toLowerCase()] = set['id']
        }
        if (!combinationButtons[reverseSet['series']]) {
            combinationButtons[reverseSet['series']] = {
                'setA_img': reverseSet['images']['symbol'],
                'setB_img': reverseSet['images']['symbol'],
                'sets': [reverseSet['id']]
            }
        }
        else {
            //prevent promo from being image
            if(combinationButtons[reverseSet['series']]['setA_img'].split('/symbol.png')[0].slice(-1) != '1') {
                combinationButtons[reverseSet['series']]['setA_img'] = reverseSet['images']['symbol']
            }
            combinationButtons[reverseSet['series']]['setB_img'] = reverseSet['images']['symbol']
            combinationButtons[reverseSet['series']]['sets'].push(reverseSet['id'])
        }
        rightButtons.appendChild(
            createElement('div', null, {
                'id': 'set.id:' + set['id'],
                'class': 'parameterButtonDiv',
                'title': set['name'],
                'onclick': 'toggleParameterButton(this, true)'
            })
        ).appendChild(
            createElement('img', null, {
                'class': 'parameterButton fadeIn',
                'src': set['images']['symbol'],
                'alt': 'set.id:' + set['id']
            })
        )
    }
    setsLoaded = true

    // LEFT SIDE
    var leftButtons = parameterButtonsDiv.appendChild(createElement('div', null, {'id': 'leftButtons', 'class': 'parameterButtonsSubContainer', 'style': 'left: 0;'}))
    
    var types = [
        'Grass',
        'Fire',
        'Water',
        'Lightning',
        'Psychic',
        'Fighting',
        'Darkness',
        'Metal',
        'Fairy',
        'Dragon',
        'Colorless'
    ]
    for (i=0; i<types.length; i++) {
        leftButtons.appendChild(
            createElement('div', null, {
                'id': 'types:%22' + types[i].toLocaleLowerCase() + '%22',
                'class': 'parameterButtonDiv',
                'title': types[i],
                'onclick': 'toggleParameterButton(this, true)'
            })
        ).appendChild(
            createElement('img', null, {
                'class': 'parameterButton fadeIn',
                'src': 'images/type_symbols/' + types[i].toLowerCase() + '.png'
            })
        )
    }

    leftButtons.appendChild(createElement('div', null, {'class': 'parameterButtonSpacer'}))
    var subtypes = [
        'Basic',
        'Stage 1',
        'Stage 2',
        'Supporter',
        'Item',
        'Stadium'
    ]
    for (i=0; i<subtypes.length; i++) {
        leftButtons.appendChild(
            createElement('div', null, {
                'id': 'subtypes:%22' + subtypes[i].toLocaleLowerCase() + '%22',
                'class': 'parameterButtonDiv parameterButtonDivWide',
                'title': subtypes[i],
                'onclick': 'toggleParameterButton(this, true)'
            })
        ).appendChild(
            createElement('img', null, {
                'class': 'parameterButton parameterButtonWide fadeIn',
                'src': 'images/subtypes/' + subtypes[i].toLowerCase() + '.png'
            })
        )
    }

    leftButtons.appendChild(createElement('div', null, {'class': 'parameterButtonSpacer'}))
    for (key in combinationButtons) {
        var combinationButton = combinationButtons[key]
        if (combinationButton['sets'].length == 1) {
            continue
        }
        var newButton = leftButtons.appendChild(
            createElement('div', null, {
                'id': key,
                'class': 'parameterButtonDiv fadeIn',
                'title': key,
                'onclick': `toggleParameterButton(this, true, ['set.id:${combinationButton['sets'].join("','set.id:")}'], true)`
            }))
        newButton.appendChild(
            createElement('img', null, {
                'class': 'parameterButton',
                'src': combinationButton['setB_img'],
                'style': 'transform: translateX(calc(var(--cardWidth)/12)) translateY(calc(-1 * var(--cardWidth)/12)) scale(0.85)'
            })
        )
        newButton.appendChild(
            createElement('img', null, {
                'class': 'parameterButton',
                'src': combinationButton['setA_img'],
                'style': 'transform: translateX(calc(-1 * var(--cardWidth)/12)) translateY(calc(var(--cardWidth)/12)) scale(0.85)'
            })
        )
    }

    leftButtons.appendChild(createElement('div', null, {'class': 'parameterButtonSpacer'}))
    var yearLegalities = {
        '2020 - 2021': ['sm9', 'det1', 'sm10', 'sm11', 'sm115', 'mcd19', 'sm12', 'swshp', 'swsh1', 'swsh2', 'swsh3', 'swsh35', 'swsh4', 'swsh45sv', 'swsh45', 'swsh5', 'swsh6'],
        '2011 - 2021 (Expanded)': ['bwp', 'bw1', 'mcd11', 'bw2', 'bw3', 'bw4', 'bw5', 'mcd12', 'bw6', 'dv1', 'bw7', 'bw8', 'bw9', 'bw10', 'bw11', 'xyp', 'xy0', 'xy1', 'xy2', 'xy3', 'xy4', 'xy5', 'dc1', 'xy6', 'xy7', 'xy8', 'xy9', 'g1', 'xy10', 'xy11', 'xy8', 'xy9', 'g1', 'xy10', 'xy11', 'mcd16', 'xy12', 'smp', 'sm1', 'sm2', 'sm3', 'sm35', 'sm4', 'sm5', 'sm6', 'sm7', 'sm75', 'sm8', 'sm9', 'det1', 'sm10', 'sm11', 'sma', 'sm115', 'mcd19', 'sm12', 'swshp', 'swsh1', 'swsh2', 'swsh3', 'swsh35', 'swsh4', 'swsh45sv', 'swsh45', 'swsh5', 'swsh6'],
        '2019 - 2020': ['sm5', 'sm6', 'sm7', 'sm75', 'sm8', 'sm9', 'det1', 'sm10', 'sm11', 'sm115', 'mcd19', 'sm12', 'swsh1', 'swsh2', 'swsh3'],
        '2018 - 2019': ['sm5', 'sm6', 'sm7', 'sm75', 'sm8', 'sm9', 'det1', 'sm10', 'sm11'],
        '2017 - 2018': ['xy8', 'xy9', 'g1', 'xy10', 'xy11', 'mcd16', 'xy12', 'sm1', 'sm2', 'sm3', 'sm35', 'sm4', 'sm5', 'sm6', 'sm7'],
        '2016 - 2017': ['xy5', 'dc1', 'xy6', 'xy7', 'xy8', 'xy9', 'g1', 'xy10', 'xy11', 'mcd16', 'xy12', 'sm1', 'sm2', 'sm3'],
        '2015 - 2016': ['xy0', 'xy1', 'xy2', 'xy3', 'xy4', 'xy5', 'dc1', 'xy6', 'xy7', 'xy8', 'xy9', 'g1', 'xy10', 'xy11'],
        '2014 - 2015': ['bw7', 'bw8', 'bw9', 'bw10', 'bw11', 'xy0', 'xy1', 'xy2', 'xy3', 'xy4', 'xy5', 'dc1', 'xy6'],
        '2013 - 2014': ['bw4', 'bw5', 'mcd12', 'bw6', 'dv1', 'bw7', 'bw8', 'bw9', 'bw10', 'bw11', 'xy0', 'xy1', 'xy2'],
        '2012 - 2013': ['bw1', 'mcd11', 'bw2', 'bw3', 'bw4', 'bw5', 'mcd12', 'bw6', 'dv1', 'bw7', 'bw8', 'bw9'],
        '2011 - 2012': ['hgss1', 'hgss2', 'hgss3', 'hgss4', 'col1', 'bw1', 'mcd11', 'bw2', 'bw3', 'bw4', 'bw5'],
        '2010 - 2011': ['hgss1', 'hgss2', 'hgss3', 'hgss4', 'col1', 'bw1'],
        '2009 - 2010': ['dp1', 'dp2', 'pop6', 'dp3', 'dp4', 'pop7', 'dp5', 'dp6', 'pop8', 'dp7', 'pl1', 'pop9', 'pl2', 'pl2', 'pl3', 'pl4', 'ru1', 'hgss1', 'hgss2'],
        '2008 - 2009': ['dp1', 'dp2', 'pop6', 'dp3', 'dp4', 'pop7', 'dp5', 'dp6', 'pop8', 'dp7', 'pl1', 'pop9', 'pl2', 'pl2'],
        '2007 - 2008': ['ex13', 'pop4', 'ex14', 'ex15', 'ex16', 'pop5', 'dp1', 'dp2', 'pop6', 'dp3', 'dp4', 'pop7', 'dp5'],
        '2006 - 2007': ['ex8', 'ex9', 'pop2', 'ex10', 'ex11', 'ex12', 'pop3', 'ex13', 'pop4', 'ex14', 'ex15', 'ex16', 'pop5'],
        '2005 - 2006': ['ex5', 'pop1', 'ex6', 'ex7', 'ex8', 'ex9', 'pop2', 'ex10', 'ex11', 'ex12', 'pop3', 'ex13'],
        '2004 - 2005': ['ex1', 'ex2', 'ex3', 'ex4', 'ex5', 'pop1', 'ex6', 'ex7', 'ex8', 'ex9'],
        '2003 - 2004': ['ecard1', 'ecard2', 'ecard3', 'ex1', 'ex2', 'ex3', 'ex4', 'ex5'],
        '2002 - 2003': ['neo1', 'neo2', 'si1', 'neo3', 'neo4', 'base6', 'ecard1', 'ecard2', 'ecard3'],
        '2001 - 2002': ['base5', 'gym1', 'gym2', 'neo1', 'neo2', 'si1', 'neo3', 'neo4', 'base6'],
        '2000 - 2001': ['base1', 'base2', 'base3', 'base4', 'base5', 'gym1', 'gym2', 'neo1', 'neo2', 'si1'],
    }
    for (key in yearLegalities) {
        leftButtons.appendChild(
            createElement('div', null, {
                'id': key,
                'class': 'parameterButtonDiv parameterButtonDivLarge',
                'title': key,
                'onclick': `toggleParameterButton(this, true, ['set.id:${yearLegalities[key].join("','set.id:")}'], true)`
            })
        ).appendChild(
            createElement('img', null, {
                'class': 'parameterButton parameterButtonLarge fadeIn',
                'src': 'images/legalities/' + key + '.png'
            })
        )
    }
}

//UNIVERSAL FUNCTIONS –––––––– UNIVERSAL FUNCTIONS –––––––– UNIVERSAL FUNCTIONS –––––––– UNIVERSAL FUNCTIONS –––––––– UNIVERSAL FUNCTIONS –––––––– UNIVERSAL FUNCTIONS –––––––– UNIVERSAL FUNCTIONS –––––––– UNIVERSAL FUNCTIONS

function LOG_normal(text) {
    console.log(text)
    logs.push(text)
}

function LOG_error(text) {
    console.error(text)
    logs.push(text)
}

function LOG_alertNormal(text) {
    console.log(text)
    logs.push(text)
    alert(text)
}

function LOG_alertError (text) {
    console.error(text)
    logs.push(text)
    alert(text)
}

function windowResize () {
    windowHeight = window.innerHeight
    windowWidth = window.innerWidth
    var orientables = document.getElementsByClassName('orientable')
    if (orientables.length > 0) {
        if (windowWidth <= windowHeight) {
            for (i=0; i<orientables.length; i++) {
                var elem = orientables[i]
                elem.classList.remove('landscape')
                elem.classList.add('portrait')
            }
        }
        else {
            for (i=0; i<orientables.length; i++) {
                var elem = orientables[i]
                elem.classList.remove('portrait')
                elem.classList.add('landscape')
            }
        }
    }
}

function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createElement (type, innerHTML, attributes) {
    var elem = document.createElement(type)
    elem.innerHTML = innerHTML
    for (const attr in attributes) {
        elem.setAttribute(attr, attributes[attr])
    }

    if (elem.classList.contains('orientable')) {
        if (windowWidth <= windowHeight) {
            elem.classList.add('portrait')
        }
        else {
            elem.classList.add('landscape') 
        }
    }
    return elem
}

function darkenScreen () {
    return document.body.appendChild(createElement('div', null, {
                'id': 'focused',
                'class': 'fadeIn',
                'onclick': 'if(event.target === this) {animateRemoveElement(this, "fadeOut"); currentFocused = null}'
            }))
}

var elementsToRemove = {}
function removeElement (elem, time) {
    if (elementsToRemove[time]) {
        elementsToRemove[time].push(elem)
    }
    else {
        elementsToRemove[time] = [elem]
    }
    setTimeout(function () {
        if (elementsToRemove[time][0]) {
            elementsToRemove[time][0].remove()
        }
        elementsToRemove[time].splice(0, 1)
        if (elementsToRemove[time].length == 0) {
            delete elementsToRemove[time]
        }
    }, time)
}

function animateRemoveElement (elem, animation) {
    elem.classList.add(animation)
    removeElement(elem, 250)
}

function loadingAlertStart (url) {
    loadingQueue = loadingQueue + 1
    LOG_normal(`Fetching ${url}`)
    document.getElementById('loadingGif').setAttribute('style', 'visibility: visible')
}

function loadingAlertEnd (url, succeeded) {
    loadingQueue = loadingQueue - 1
    if (loadingQueue == 0) {
        document.getElementById('loadingGif').setAttribute('style', 'visibility: hidden')
    }
    if (succeeded == true) {
        LOG_normal(`Recieved ${url}`)
    }
    else {
        LOG_error(`Failed to recieve ${url}`)
    }
}

async function fetchCards (url) {
    loadingAlertStart(url)

    currentFetchID++
    const id = currentFetchID
    
    try {
        const response = await fetch(url)
        const json = await response.json()

        loadingAlertEnd(url, true)

        return {
            'id': id,
            'cards': json['data'],
            'page': json['page'],
            'pageSize': json['pageSize'],
            'totalCardCount': json['totalCount']
        }
    }
    catch {
        loadingAlertEnd(url, false)
    }
}

function createHoloAnimation () {
    const holoSpeed = Number(window.getComputedStyle(document.documentElement).getPropertyValue('--holoSpeed'))
    const holoFPS = Number(window.getComputedStyle(document.documentElement).getPropertyValue('--holoFPS'))
    return createElement('div', null, {
        'class': 'holo',
        'style': `animation-delay: -${randomInteger(0, holoSpeed * holoFPS) / holoFPS}s`
    })
}

function createCard (data) {
    //UNOWN FIX
    if (data['id']) {
        data['id'] = data['id'].replace('?', 'question').replace('!', 'exclamation')
    }
    //RESHIRAM & ZEKROM PROMO FIX
    if (data['images']['small'] == 'https://images.pokemontcg.io/bwp/BW004.png') {
        data['images']['small'] = 'https://images.pokemontcg.io/bwp/BW04.png'
    }
    else if (data['images']['small'] == 'https://images.pokemontcg.io/bwp/BW005.png') {
        data['images']['small'] = 'https://images.pokemontcg.io/bwp/BW05.png'
    }

    var container = createElement('div', null, {
        'id': data['id'],
        'class': 'card fadeIn',
        'oncontextmenu': 'event.preventDefault(); focusCard(this)',
        'onclick': 'if(event.target === this) {focusCard(this)}',
        'onmouseenter': 'sidebarCardHover(this)',
        'ontouchstart': 'sidebarCardHover(this)'
    })

    var cardImageContainer = container.appendChild(createElement('div', null, {
        'class': 'cardImageContainer',
    }))

    cardImageContainer.appendChild(createElement('img', null, {
        'class': 'cardImage',
        'src': data['images']['small']
    }))

    var holo = false
    for (var i=0; i<holoRarities.length; i++) {
        if (data['rarity'] == holoRarities[i]) {
            holo = true
            break
        }
    }
    if (holo == false) {
        if (data['tcgplayer'] && data['tcgplayer']['prices'] && data['tcgplayer']['prices']['holofoil']) {
            holo = true
        }
    }
    if (holo === true) {
        cardImageContainer.appendChild(createHoloAnimation())
    }

    var dataContainer = createElement('div', null, {
        'class': 'data'
    })
    delete data['id']
    for (const key in data) {
        if (typeof data[key] != 'string') {
            data[key] = JSON.stringify(data[key])
        }
        dataContainer.setAttribute(key, data[key])
    }

    container.appendChild(dataContainer)
    
    return container
}

function cloneCard (card, modifications) {
    newCard = card.cloneNode(true)
    for (const key in modifications) {
        const mod = modifications[key]
        if (mod == null) {
            newCard.removeAttribute(key)
        }
        else if (key == 'image') {
            newCard.prepend(
                createElement('img', null, {
                    'src': mod,
                    'class': 'cardImage',
                    'onload': 'if(this.parentNode && this.parentNode.getElementsByClassName("cardImage")[1]) {this.parentNode.getElementsByClassName("cardImage")[1].remove()}'
                })
            )
        }
        else {
            newCard.setAttribute(key, mod)
        }
    }

    if (newCard.getElementsByClassName('cardHoverMenu')[0]) {
        newCard.getElementsByClassName('cardHoverMenu')[0].remove()
    }

    if (newCard.classList.contains('orientable')) {
        if (windowWidth <= windowHeight) {
            newCard.classList.add('portrait')
        }
        else {
            newCard.classList.add('landscape') 
        }
    }
    return newCard
}

function exportTxt(text, filename) {
    var elem = document.createElement('a')
    elem.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text))
    elem.setAttribute('download', filename)
    elem.style.display = 'none'
    document.body.appendChild(elem)
    elem.click()
    elem.remove()
}

function downloadTempButton (filename, data) {
    var temp = document.createElement('a');
    temp.download = filename;
    temp.href = data;
    document.body.appendChild(temp);
    temp.click();
    temp.remove();
}

function downloadImageLink(url, filename) {
    fetch(url, {
        headers: new Headers({
        'Origin': location.origin
        }),
        mode: 'cors'
    })
    .then(response => response.blob())
    .then(blob => {
        var blobUrl = window.URL.createObjectURL(blob);
        downloadTempButton(filename, blobUrl)
    })
    .catch(error => console.error(error));
}

//HELP MENU
function openHelpMenu () {
    var helpMenu = darkenScreen()
    helpMenu.appendChild(createElement('h1', 'Welcome to Pokegear.app!', {
        'id': 'helpMenuTitle'
    }))
    helpMenu.appendChild(createElement('h3', 'Designed by <a href="https://twitter.com/jakekgearhart">Jake Gearhart</a>', {
        'id': 'helpMenuSubtitle'
    }))
    helpMenu.appendChild(createElement('p', 'The comprehensive deck builder and viewer for the Pokémon Trading Card Game based on the <a href="https://pokemontcg.io">pokemontcg.io</a> API.', {
        'id': 'helpMenuText'
    }))
    helpMenu.appendChild(createElement('p', 'You can search for cards to add to your deck using the sidebar found to the left of the screen. Hover over the blue tab with the arrow to open it. Expand it to full screen by clicking on the arrow. Search for cards by using the buttons at the bottom or type in the search bar at the top. Clicking the + button will add a new search field so you can search using multiple criteria. Click any card to view it in fullscreen. Once a card is in the deck, you can move it around by dragging it.', {
        'id': 'helpMenuText'
    }))
    helpMenu.appendChild(createElement('p', 'To add proxies into the program, simply drag and drop an image of a card into the deck. You can customize if the card is holo or not by clicking on the card and clicking the top left button in the fullscreen menu.', {
        'id': 'helpMenuText'
    }))
    helpMenu.appendChild(createElement('p', 'You can import or export decks from your clipboard or browser\'s local storage using the ↥/↧ buttons to the right of the screen. The 🔓 button allows you to prevent changes to the deck as well as hides the +/- buttons when hovering over cards (best for recording a video on your decks). You can automatically sort the deck with the ⟳ button, or drag cards in the deck to sort it yourself. The slider allows you to enlarge or shrink the visual size of cards in the deck. Remove all cards in the deck or delete a saved deck by using the 🗑 button.', {
        'id': 'helpMenuText'
    }))
    helpMenu.appendChild(createElement('p', 'Clicking the ✦ in the ⚙ (settings) menu will disable the holo effect on cards. Clicking 🔢 will hide/show the numbers on individual cards. Clicking 🗒 ↧ will export the log of actions for this session.', {
        'id': 'helpMenuText'
    }))
    helpMenu.appendChild(createElement('p', 'Pokegear logo designed by <a href="https://zachroy.com">Zach Roy</a>', {
        'id': 'helpMenuText'
    }))
}

//SETTINGS –––––––– SETTINGS –––––––– SETTINGS –––––––– SETTINGS –––––––– SETTINGS –––––––– SETTINGS –––––––– SETTINGS –––––––– SETTINGS –––––––– SETTINGS –––––––– SETTINGS –––––––– SETTINGS –––––––– SETTINGS –––––––– SETTINGS
function openSettings () {
    LOG_normal('Opened settings')
    var settingsMenu = darkenScreen()
    var toggleHoloGlobal = settingsMenu.appendChild(createElement('input', null, {
        'id': 'toggleHoloGlobal',
        'class': 'fadeIn buttonObject',
        'title': 'Toggle Card Holo Effect',
        'type': 'submit',
        'onclick': 'toggleHoloGlobal()'
    }))
    toggleHoloGlobal.appendChild(createElement('p', 'TESTING', null))
    const holoVisible = Number(window.getComputedStyle(document.documentElement).getPropertyValue('--holoVisible'))
    if (holoVisible == 0) {
        toggleHoloGlobal['value'] = '✧'
    }
    else {
        toggleHoloGlobal['value'] = '✦'
    }

    var exportConsole = settingsMenu.appendChild(createElement('input', null, {
        'id': 'exportConsole',
        'class': 'fadeIn buttonObject',
        'title': 'Export Console to File',
        'type': 'submit',
        'value': '🗒 ↧',
        'onclick': 'exportConsole()'
    }))

    var toggleIndividualCardNumbers = settingsMenu.appendChild(createElement('input', null, {
        'id': 'toggleIndividualCardNumbers',
        'class': 'fadeIn buttonObject',
        'title': 'Hide/Show Individual Card Numbers',
        'type': 'submit',
        'value': '🔢',
        'onclick': 'toggleIndividualCardNumbers()'
    }))
}

function toggleHoloGlobal() {
    const holoVisible = Number(window.getComputedStyle(document.documentElement).getPropertyValue('--holoVisible'))
    if (holoVisible == 0) {
        document.getElementById('toggleHoloGlobal').value = '✦'
        document.documentElement.style.setProperty('--holoVisible', 1);
        LOG_normal('Enabled holo animations')
    }
    else {
        document.getElementById('toggleHoloGlobal').value = '✧'
        document.documentElement.style.setProperty('--holoVisible', 0);
        LOG_normal('Disabled holo animations')
    }
}

function exportConsole() {
    var exportText
    for (i=0; i<logs.length; i++) {
        if (i == 0) {
            exportText = `(${i+1})\n\n${JSON.stringify(logs[i])}\n`
        }
        else {
            exportText = `${exportText}\n(${i+1})\n\n${JSON.stringify(logs[i])}\n`
        }
    }
    exportTxt(exportText, 'console.txt')
    LOG_normal('Exported console')
}

function toggleIndividualCardNumbers() {
    const cardCountVisible = Number(window.getComputedStyle(document.documentElement).getPropertyValue('--cardCountVisible'))
    if (cardCountVisible == -1) {
        document.documentElement.style.setProperty('--cardCountVisible', 0);
        LOG_normal('Made card count visible')
    }
    else {
        document.documentElement.style.setProperty('--cardCountVisible', -1);
        LOG_normal('Made card count invisible')
    }
}

//CARD MECHANICS –––––––– CARD MECHANICS –––––––– CARD MECHANICS –––––––– CARD MECHANICS –––––––– CARD MECHANICS –––––––– CARD MECHANICS –––––––– CARD MECHANICS –––––––– CARD MECHANICS –––––––– CARD MECHANICS –––––––– CARD MECHANICS
function toggleHolo(cardsToToggle) {
    for (i=0; i<cardsToToggle.length; i++) {
        var cardToToggle = cardsToToggle[i]
        if (cardToToggle.getElementsByClassName('holo')[0]) {
            cardToToggle.getElementsByClassName('holo')[0].remove()
            if (cardToToggle.classList.contains('focusedCard')) {
                document.getElementById('focusedHolo').innerHTML = '✧'
            }
        }
        else {
            cardToToggle.getElementsByClassName('cardImageContainer')[0].appendChild(createHoloAnimation())
            if (cardToToggle.classList.contains('focusedCard')) {
                document.getElementById('focusedHolo').innerHTML = '✦'
            }
        }
    }
}

function cardHover (card) {
    card.classList.add('hoveredCard')
    if (card.getElementsByClassName('cardHoverMenu')[0]) {
        card.getElementsByClassName('cardHoverMenu')[0].remove()
    }
    while (card.getElementsByClassName('cardImageDuplicate')[0]) {
        card.getElementsByClassName('cardImageDuplicate')[0].remove()
    }
    if (isDeckLocked == false) {
        if (card.getElementsByClassName('cardHoverMenu')[0]) {
            card.getElementsByClassName('cardHoverMenu')[0].remove()
        }
        card.appendChild(createElement('div', null, {
            'class': 'cardHoverMenu fadeIn'
        }))
        card.getElementsByClassName('cardHoverMenu')[0]
    }
}

function cardUnhover (card) {
    card.classList.remove('hoveredCard')
    if (card.getElementsByClassName('cardHoverMenu')[0]) {
        animateRemoveElement(card.getElementsByClassName('cardHoverMenu')[0], 'fadeOut')
    }
    for (i=0; i<card.getElementsByClassName('cardImageDuplicate').length; i++) {
        var cardImageDuplicate = card.getElementsByClassName('cardImageDuplicate')[i]
        animateRemoveElement(cardImageDuplicate, 'removeCardImageDuplicate')
    }
}

function focusCard (card) {
    if (!isCardInView(card)) {
        card.scrollIntoView({behavior: 'smooth', block: 'nearest'});
    }
    var oldFocusedOrigin = document.querySelectorAll('.focusedOrigin')
    for (i=0; i<oldFocusedOrigin.length; i++) {
        oldFocusedOrigin[i].classList.remove('focusedOrigin')
    }
    card.classList.add('focusedOrigin')

    currentFocused = card
    var focused
    var focusedPrice
    var leftButton
    var rightButton
    if (document.getElementById('focused')) {
        focused = document.getElementById('focused')
        focusedCenter = document.getElementById('focusedCenter')

        focusedPrice = document.getElementById('focusedPrice')
        focusedPrice.innerHTML = 'No Prices Available'
        focusedPrice.setAttribute('onclick', null)

        // focusedAlts = document.getElementById('focusedAlts')

        focusedHolo = document.getElementById('focusedHolo')
        focusedCount = document.getElementById('focusedCount')
        focusedDownload = document.getElementById('focusedDownload')
        focusedSet = document.getElementById('focusedSet')
        leftButton = document.getElementById('focusedLeft')
        rightButton = document.getElementById('focusedRight')
        focusedCenter.getElementsByClassName('focusedCard')[0].remove()
    }
    else {
        focused = darkenScreen()
        focusedCenter = focused.appendChild(createElement('div', null, {
            'id': 'focusedCenter',
            'class': 'orientable'
        }))
        focusedHolo = focusedCenter.appendChild(createElement('button', '', {
            'id': 'focusedHolo',
            'class': 'fadeIn buttonObject focusedButton orientable',
            'title': 'Toggle Holo Effect',
            'onclick': 'toggleHolo([document.getElementsByClassName("focusedCard")[0], document.getElementsByClassName("focusedOrigin")[0]])'
        }))
        focusedCount = focusedCenter.appendChild(createElement('button', 0, {
            'id': 'focusedCount',
            'class': 'fadeIn buttonObject focusedButton orientable',
            'title': 'Amount in Deck',
            'count': 0,
            'onmouseenter': 'this.innerHTML = "+"',
            'onmouseleave': 'this.innerHTML = this.getAttribute("count")',
            'onclick': "if(isDeckLocked == false) {addDeckCard(cloneCard(document.getElementsByClassName('focusedOrigin')[0], {}), +1)}",
        }))
        focusedDownload = focusedCenter.appendChild(createElement('button', '↧', {
            'id': 'focusedDownload',
            'class': 'fadeIn buttonObject focusedButton orientable',
            'title': 'Download Image'
        }))
        focusedSet = focusedCenter.appendChild(createElement('button', null, {
            'id': 'focusedSet',
            'class': 'fadeIn buttonObject focusedButton orientable'
        }))
        leftButton = focusedCenter.appendChild(createElement('button', '❮', {
            'id': 'focusedLeft',
            'class': 'buttonObject focusedButton orientable',
            'title': 'Next Card',
            'onclick': 'event.preventDefault(); cycleFocused("left")'
        }))
        rightButton = focusedCenter.appendChild(createElement('button', '❯', {
            'id': 'focusedRight',
            'class': 'buttonObject focusedButton orientable',
            'title': 'Previous Card',
            'onclick': 'cycleFocused("right")'
        }))
        focusedPrice = focused.appendChild(createElement('button', 'No Prices Available', {
            'id': 'focusedPrice',
            'class': 'buttonObject focusedButton focusedSides orientable',
            'title': 'Open Card In TCGPlayer'
        }))
        // focusedAlts = focused.appendChild(createElement('button', 'Cards With Same Name', {
        //     'id': 'focusedAlts',
        //     'class': 'buttonObject focusedButton focusedSides orientable',
        //     'title': 'Cards With Same Name'
        // }))
    }

    //left buttpn
    if (currentFocused.previousElementSibling && currentFocused.previousElementSibling.classList.contains('card')) {
        leftButton.setAttribute('style', 'cursor: pointer')
    }
    else {
        leftButton.setAttribute('style', 'cursor: not-allowed')
    }

    //right button
    if (currentFocused.nextElementSibling && currentFocused.nextElementSibling.classList.contains('card')) {
        rightButton.setAttribute('style', 'cursor: pointer')
    }
    else {
        rightButton.setAttribute('style', 'cursor: not-allowed')
    }

    // count
    // if card with matching ID is in the deck
    if (deckCards.querySelector(`#${card['id']}`)) {
        var cardCount = deckCards.querySelector(`#${card['id']}`).getAttribute('count')
        focusedCount.innerHTML = cardCount
        focusedCount.setAttribute('count', cardCount)
    }

    var dataContainer = card.getElementsByClassName('data')[0]

    var rotation = 0
    if (dataContainer.getAttribute('subtypes') && (dataContainer.getAttribute('subtypes').includes('BREAK') || dataContainer.getAttribute('subtypes').includes('LEGEND'))) {
        rotation = 90
    }

    if(dataContainer.getAttribute('set')) {
        focusedSet.title = JSON.parse(dataContainer.getAttribute('set'))['name']
        focusedSet.innerHTML = ''
        focusedSet.appendChild(createElement('img', null, {
            'src': JSON.parse(dataContainer.getAttribute('set'))['images']['symbol'],
            'style': 'height: 75%; width: 75%; object-fit: contain'
        }))
        if (document.getElementById(`set.id:${JSON.parse(dataContainer.getAttribute('set'))['id']}`).classList.contains('selectedButton')) {
            focusedSet.classList.add('parameterButtonDivSelected')
        }
        focusedSet.setAttribute('onclick', `toggleParameterButton(document.getElementById('set.id:${JSON.parse(dataContainer.getAttribute('set'))['id']}'), true); if (this.classList.contains('parameterButtonDivSelected')) {this.classList.remove('parameterButtonDivSelected')} else {this.classList.add('parameterButtonDivSelected')}`)
    }
    else {
        focusedSet.innerHTML = '?'
    }

    focusedCenter.prepend(cloneCard(card, {
            'style': `transform: rotate(${rotation}deg);`,
            'class': 'focusedCard orientable',
            'image': JSON.parse(dataContainer.getAttribute('images'))['large']
    }))

    var newCard = focusedCenter.getElementsByClassName('focusedCard')[0]

    //holo button
    if (newCard.getElementsByClassName('holo')[0]) {
        focusedHolo.innerHTML = '✦'
    }
    else {
        focusedHolo.innerHTML = '✧'
    }

    //remove individualCardCount, and cardHoverMenu
    var remove = ['individualCardCount', 'cardHoverMenu']
    for (i=0; i<remove.length; i++) {
        if (newCard.getElementsByClassName(remove[i])[0]) {
            newCard.getElementsByClassName(remove[i])[0].remove()
        }
    }
    while (newCard.getElementsByClassName('cardImageDuplicate')[0]) {
        newCard.getElementsByClassName('cardImageDuplicate')[0].remove()
    }

    //change holo speed
    if (newCard.getElementsByClassName('holo')[0]) {
        newCard.getElementsByClassName('holo')[0].classList.add('focusedHolo')
    }

    //download
    if (!dataContainer.getAttribute('custom-card') == true) {
        focusedDownload.setAttribute('onclick', `downloadImageLink("${JSON.parse(dataContainer.getAttribute('images'))['large']}", "${dataContainer.getAttribute('name').replace(' ', '-').toLowerCase()}-${card.id}.png")`)
        focusedDownload.setAttribute('style', 'cursor: pointer')
    }
    else {
        focusedDownload.setAttribute('onclick', '')
        focusedDownload.setAttribute('style', 'cursor: not-allowed')
    }

    //add price data
    if (dataContainer.getAttribute('tcgplayer')) {
        var tcgplayerData = JSON.parse(dataContainer.getAttribute('tcgplayer'))
        focusedPrice.setAttribute('onclick', `window.open('${tcgplayerData['url']}', '_blank');`)
        focusedPrice.setAttribute('style', 'cursor: pointer')
        if (JSON.parse(dataContainer.getAttribute('tcgplayer'))['prices'] && Object.keys(tcgplayerData['prices']).length != 0) {
            focusedPrice.innerHTML = null
            var prices = []
            var pricesData = JSON.parse(dataContainer.getAttribute('tcgplayer'))['prices']
            for (priceData in pricesData) {
                if (pricesData[priceData]['directLow'] || pricesData[priceData]['low'] || pricesData[priceData]['market']) {
                    if (priceDataTranslations[priceData]) {
                        focusedPrice.appendChild(createElement('p', priceDataTranslations[priceData], {'style': 'font-weight: bold; text-decoration: underline; text-shadow: 0px 0px 8px var(--darkBlue);'}))
                    }
                    else {
                        focusedPrice.appendChild(createElement('p', priceData, {'style': 'font-weight: bold'}))
                    }
                    if (pricesData[priceData]['directLow']) {
                        focusedPrice.appendChild(createPriceElement(`Direct: $${pricesData[priceData]['directLow']}`, 'mediumorchid'))
                    }
                    if (pricesData[priceData]['market']) {
                        focusedPrice.appendChild(createPriceElement(`Market: $${pricesData[priceData]['market']}`, 'paleturquoise'))
                    }
                    if (pricesData[priceData]['low']) {
                        focusedPrice.appendChild(createPriceElement(`Low: $${pricesData[priceData]['low']}`, 'chartreuse'))
                    }
                    if (pricesData[priceData]['high']) {
                        focusedPrice.appendChild(createPriceElement(`High: $${pricesData[priceData]['high']}`, 'crimson'))
                    }
                    focusedPrice.appendChild(createElement('br', null, null))
                }
            }
            focusedPrice.appendChild(createElement('p', 'Last Updated', {'style': 'font-style: italic; text-shadow: 0px 0px 8px var(--darkBlue);'}))
            focusedPrice.appendChild(createElement('p', tcgplayerData['updatedAt'], {'style': 'font-style: italic; text-shadow: 0px 0px 8px var(--darkBlue);'}))
        }
        focusedPrice.prepend(createElement('p', 'Click To Open On tcgplayer.com', {'style': 'font-style: italic; text-shadow: 0px 0px 8px var(--darkBlue);'}), createElement('br', null, null))
    }
    else {
        focusedPrice.setAttribute('style', 'cursor: not-allowed')
    }
}

function createPriceElement (price, color) {
    if (!price.split('.')[1]) {
        price = price + '.00'
    }
    else if (price.split('.')[1].length == 1) {
        price = price + '0'
    }
    return createElement('p', price, {'style': `font-style: italic; text-shadow: 0px 0px 8px var(--darkBlue); color: ${color};`})
}

function cycleFocused (direction) {
    var newFocused
    if (direction == 'left' && currentFocused.previousElementSibling && currentFocused.previousElementSibling.classList.contains('card')) {
        newFocused = currentFocused.previousElementSibling
        focusCard(newFocused)
    }
    else if (direction == 'right' && currentFocused.nextElementSibling && currentFocused.nextElementSibling.classList.contains('card')) {
        newFocused = currentFocused.nextElementSibling
        focusCard(newFocused)
    }
}

//SIDEBAR –––––––– SIDEBAR –––––––– SIDEBAR –––––––– SIDEBAR –––––––– SIDEBAR –––––––– SIDEBAR –––––––– SIDEBAR –––––––– SIDEBAR –––––––– SIDEBAR –––––––– SIDEBAR –––––––– SIDEBAR –––––––– SIDEBAR –––––––– SIDEBAR –––––––– SIDEBAR

function fullScreenSidebar (fullScreen) {
    var sidebarArrow = document.getElementById('sidebarArrow')
    if (fullScreen == true) {
        sidebarDiv.setAttribute('style', 'width: 100%; margin-left: 0%')
        sidebarArrow.setAttribute('value', '❮')
        sidebarArrow.title = 'Click to Minimize'
        sidebarArrow.setAttribute('onclick', 'fullScreenSidebar(false)')
    }
    if (fullScreen == false) {
        sidebarDiv.style = ''
        sidebarArrow.setAttribute('value', '❯')
        sidebarArrow.title = 'Click to Expand'
        sidebarArrow.setAttribute('onclick', 'fullScreenSidebar(true)')
    }
}

function toggleParameterButton (elem, initiateSearch, group, conform) {
    if (!elem.classList.contains('parameterButtonDivSelected')) {
        enableParameterButton(elem, initiateSearch, group, conform)
    }
    else {
        disableParameterButton(elem, initiateSearch, group, conform)
    }
}

function enableParameterButton (elem, initiateSearch, group, conform) {
    elem.classList.add('parameterButtonDivSelected')
    if (!group || group.length < 1) {
        elem.classList.add('selectedButton')
    }
    else {
        for (i=0; i<group.length; i++) {
            if (conform == true) {
                enableParameterButton(document.getElementById(group[i]), false);
            }
            else {
                toggleParameterButton(document.getElementById(group[i]), false);
            }
        }
    }
    if (initiateSearch == true) {
        constructSearchUrl()
    }
}

function disableParameterButton (elem, initiateSearch, group, conform) {
    elem.classList.remove('parameterButtonDivSelected')
    if (!group || group.length < 1) {
        elem.classList.remove('selectedButton')
    }
    else {
        for (i=0; i<group.length; i++) {
            if (conform == true) {
                disableParameterButton(document.getElementById(group[i]), false);
            }
            else {
                toggleParameterButton(document.getElementById(group[i]), false);
            }
        }
    }
    if (initiateSearch == true) {
        constructSearchUrl()
    }  
}

function constructSearchUrl () {
    if (cooldown == true) {
        queuedSearch = true
        return
    }
    cooldown = true
    queuedSearch = false
    setTimeout(() => {
        cooldown = false
        if (queuedSearch == true) {
            constructSearchUrl ()
            queuedSearch = false
        }
    }, 1500);

    //construct URL
    var q = ''

    const parameters = document.getElementsByClassName('searchParameter')
    for (i = 0; i < parameters.length; i++) {
        var searchType = JSON.parse(parameters[i].getElementsByClassName('searchType')[0].getAttribute('searchType'))
        if (searchType.length == 0) {
            continue
        }
        var searchField = parameters[i].getElementsByClassName('searchField')[0].value
        if (searchField.length == 0) {
            continue
        }
        for (translation in urlTranslations) {
            searchField = searchField.replace(translation, urlTranslations[translation])
        }
        searchField = searchField.split(' ')
        for (j = 0; j < searchField.length; j++) {
            if (searchField[j].length > 0) {
                for (k = 0; k < searchType.length; k++) {
                    if (k == 0) {
                        q = q + '('
                    }
                    q = q + searchType[k] + ':%22*' + searchField[j] + '*%22'
                    if (k + 1 != searchType.length) {
                        q = q + '+OR+'
                    }
                    else {
                        q = q + ')+'             
                    }
                }
            }
        }
    }

    //compile selected buttons
    const selectedButtons = document.getElementsByClassName('selectedButton')
    var splitSelectedButtons = {}
    for (i=0; i<selectedButtons.length; i++) {
        if (!splitSelectedButtons[selectedButtons[i].id.split(':')[0]]) {
            splitSelectedButtons[selectedButtons[i].id.split(':')[0]] = []
        }
        splitSelectedButtons[selectedButtons[i].id.split(':')[0]].push(selectedButtons[i].id)
    }
    for (groupKey in splitSelectedButtons) {
        var group = splitSelectedButtons[groupKey]
        q = q + '(' + group[0]
        if (group.length > 1) {
            for (var i = 1; i < group.length; i++) {
                q = q + '+OR+' + group[i]
            }
        } 
        q = q + ')+'
    }

    //check for blank search
    if (q == '') {
        for (i=0; i<sidebarCards.children.length; i++) {
            animateRemoveElement(sidebarCards.children[i], 'fadeOut')
        }
        previousSearch = null
        currentFetchID++
        return
    }
    url = `https://api.pokemontcg.io/v2/cards?orderBy=set.releaseDate,number&q=${q}&page=1`

    //prevent repeat searches
    if (previousSearch == url) {
        return
    }
    else {
        previousSearch = url
    }

    fetchNewSidebarCards(url)
}

async function fetchNewSidebarCards(url) {
    loadingMoreCards = true

    //fetch URL
    const response = await fetchCards(url)

    //return if not the most recent request
    if (response['id'] != currentFetchID) {
        return
    }

    var cardData = response['cards']

    //remove existing cards
    if (document.getElementById('sidebarCardsBottom')) {
        document.getElementById('sidebarCardsBottom').remove()
    }
    if (response['page'] == 1) {
        if (cardData.length == 0) {
            for (i=0; i<sidebarCards.children.length; i++) {
                animateRemoveElement(sidebarCards.children[i], 'fadeOut')
            }
        }
        else {
            sidebarCards.innerHTML = null
            sidebarCards.scrollTop
        }
    }

    sidebarCards.setAttribute('url', url)
    sidebarCards.setAttribute('page', response['page'])
    sidebarCards.setAttribute('pageSize', response['pageSize'])
    sidebarCards.setAttribute('totalCardCount', response['totalCardCount'])

    for (i = 0; i < cardData.length; i++) {
        var newCard = createCard(cardData[i])
        sidebarCards.append(newCard)
    }

    sidebarCards.appendChild(
        createElement('div', null, {
            'id': 'sidebarCardsBottom'
        })
    )

    loadingMoreCards = false
}

function isCardInView (elem) {
    var rect = elem.getBoundingClientRect();
    var windowHeight = (window.innerHeight || document.documentElement.clientHeight);
    if ((rect.top <= windowHeight) && ((rect.top + rect.height) >= 0)) {
        return true
    }
    else {
        return false
    }
}

function scrollSidebarCheck () {
    if (loadingMoreCards == false && document.getElementById('sidebarCardsBottom') && isCardInView(sidebarCardsBottom) && (sidebarCards.getAttribute('totalCardCount') > sidebarCards.getAttribute('page') * sidebarCards.getAttribute('pageSize'))) {
        fetchNewSidebarCards(sidebarCards.getAttribute('url').split('page=')[0] + 'page=' + (Number(sidebarCards.getAttribute('page')) + 1))
    }
}

function sidebarCardHover (card) {
    cardHover(card)
    var hoverMenu = card.getElementsByClassName('cardHoverMenu')[0]
    if (hoverMenu) {
        hoverMenu.appendChild(createElement('input', null, {
            'type': 'button',
            'class': 'sidebarCardHoverButton buttonObject',
            'value': '＋',
            'onclick': 'addDeckCard(this.parentNode.parentNode, +1)'
        }))
    }
}

//DECKLIST –––––––– DECKLIST –––––––– DECKLIST –––––––– DECKLIST –––––––– DECKLIST –––––––– DECKLIST –––––––– DECKLIST –––––––– DECKLIST –––––––– DECKLIST –––––––– DECKLIST –––––––– DECKLIST –––––––– DECKLIST –––––––– DECKLIST

var cardDropTarget
function allowDrop(event) {
    event.preventDefault();
}

function drop(elem, target) {
    var siblings = target.parentElement.children
    if(Array.prototype.indexOf.call(siblings, target) > Array.prototype.indexOf.call(siblings, elem)) {
        cardDropTarget.after(elem);
    }
    else {
        cardDropTarget.before(elem);
    }
}

function addDeckCard(card, count) {
    //if card exists in deck
    // FIX: j instead of i because importDeck was being changed
    for (j=0; j<deckCards.children.length; j++) {
        if (deckCards.children[j]['id'] == card['id']) {
            modifyDeckCardCount(deckCards.children[j], count)
            return
        }
    }
    
    //if card does not exist in deck
    newCard = cloneCard(card, {
            'class': 'card deckCard fadeIn',
            'onmouseenter': 'deckCardHover(this)',
            'ontouchstart': 'deckCardHover(this)',
            'draggable': 'true',
            'ondragstart': 'if(isDeckLocked == false) {this.setAttribute("style", "transform: scale(1); box-shadow: none")}',
            'ondragend': 'if(isDeckLocked == false) {drop(this, cardDropTarget); this.removeAttribute("style")}',
            'ondragover': 'if(isDeckLocked == false) {allowDrop(event); cardDropTarget = this}',
            'count': count

        })
    if (newCard.getElementsByClassName('holo')[0]) {
        newCard.getElementsByClassName('holo')[0].classList.remove('focusedHolo')
        const holoSpeed = Number(window.getComputedStyle(document.documentElement).getPropertyValue('--holoSpeed'))
        const holoFPS = Number(window.getComputedStyle(document.documentElement).getPropertyValue('--holoFPS'))
        newCard.getElementsByClassName('holo')[0].setAttribute('style', `animation-delay: -${randomInteger(0, holoSpeed * holoFPS) / holoFPS}s`)
    }
    newCard.appendChild(createElement('input', null, {
        'type': 'button',
        'value': count,
        'class': 'individualCardCount scaledButtonObject'
    }))
    deckCards.appendChild(newCard)
    modifyDeckCardCount(null, count)

    // focused count
    var focusedCard = document.getElementsByClassName('focusedCard')[0]
    if (focusedCard && focusedCard['id'] == card['id']) {
        document.getElementById('focusedCount').setAttribute('count', 1)
    }
}

function deckCardHover (card) {
    cardHover(card)
    var hoverMenu = card.getElementsByClassName('cardHoverMenu')[0]
    if (hoverMenu) {
        hoverMenu.appendChild(createElement('input', null, {
            'type': 'button',
            'class': 'deckCardHoverButtonAdd scaledButtonObject',
            'value': '＋',
            'onclick': 'if (!this.parentNode.parentNode.classList.contains("fadeOut")) {modifyDeckCardCount(this.parentNode.parentNode, +1)}'
        }))
        hoverMenu.appendChild(createElement('input', null, {
            'type': 'button',
            'class': 'deckCardHoverButtonRemove scaledButtonObject',
            'value': '－',
            'onclick': 'if (!this.parentNode.parentNode.classList.contains("fadeOut")) {modifyDeckCardCount(this.parentNode.parentNode, -1)}'
        }))
    }
    var count = card.getAttribute('count')
    for (i=1; i<count; i++) {
        var cardImageDuplicate = card.getElementsByClassName('cardImageContainer')[0].cloneNode(true)
        cardImageDuplicate.classList.add('cardImageDuplicate')
        cardImageDuplicate.setAttribute('style', `transform: translateX(${15*i/(count-1)}%) translateY(${-15*i/(count-1)}%)`)
        card.prepend(cardImageDuplicate)
    }
}

function modifyDeckCardCount (card, value) {
    if (value == 0) {
        return
    }
    if (card && card.getElementsByClassName('individualCardCount')[0].value) {
        var dataContainer = card.getElementsByClassName('data')[0]
        const individualCardCount = Number(card.getElementsByClassName('individualCardCount')[0].value)
        if (individualCardCount + value <= 0) {
            animateRemoveElement(card, 'fadeOut')
        }
        else if (
            (individualCardCount + value > 1 && dataContainer.getAttribute('rarity') && dataContainer.getAttribute('rarity') == 'Rare ACE') ||
            (individualCardCount + value > 1 && dataContainer.getAttribute('rules') && dataContainer.getAttribute('rules').includes("◇ (Prism Star) Rule: You can't have more than 1 ◇ card with the same name in your deck. If a ◇ card would go to the discard pile, put it in the Lost Zone instead.")) ||
            (individualCardCount + value > 1 && dataContainer.getAttribute('rules') && dataContainer.getAttribute('rules').includes("You can't have more than 1 Pokémon Star in your deck.")) ||
            (individualCardCount + value > 4 && !(dataContainer.getAttribute('supertype') == 'Energy' && dataContainer.getAttribute('subtypes').includes('Basic'))) && 
            (individualCardCount + value > 4 && !(dataContainer.getAttribute('rules') && dataContainer.getAttribute('rules').includes("You may have as many of this card in your deck as you like.")))
        ) {
            card.getElementsByClassName('individualCardCount')[0].setAttribute('style', 'color: red')
        }
        else {
            card.getElementsByClassName('individualCardCount')[0].setAttribute('style', 'color: white') 
        }

        if (individualCardCount + value > 0) {
            var newValue = individualCardCount + value
            card.setAttribute('count', newValue)
            card.getElementsByClassName('individualCardCount')[0].value = newValue

            // focused count
            var focusedCard = document.getElementsByClassName('focusedCard')[0]
            if (focusedCard && focusedCard['id'] == card['id']) {
                document.getElementById('focusedCount').setAttribute('count', newValue)
            }

            // hovered card duplicates
            var hoveredCard = document.getElementsByClassName('hoveredCard')[0]
            if (hoveredCard && hoveredCard.parentElement == document.getElementById('deckCards') && hoveredCard['id'] == card['id']) {
                while (card.getElementsByClassName('cardImageDuplicate')[0]) {
                    card.getElementsByClassName('cardImageDuplicate')[0].remove()
                }
                for (i=1; i<newValue; i++) {
                    var cardImageDuplicate = card.getElementsByClassName('cardImageContainer')[0].cloneNode(true)
                    cardImageDuplicate.classList.add('cardImageDuplicate')
                    cardImageDuplicate.setAttribute('style', `transform: translateX(${15*i/(newValue-1)}%) translateY(${-15*i/(newValue-1)}%)`)
                    card.prepend(cardImageDuplicate)
                }
            }
        }
    }
    
    deckCardCount.value = Number(deckCardCount.value) + value
    if (deckCardCount.value > 60) {
        deckCardCount.setAttribute('style', 'color: red')
    }
    else if (deckCardCount.value == 60) {
        deckCardCount.setAttribute('style', 'color: #00ff00')
    }
    else {
        deckCardCount.setAttribute('style', 'color: white')
    }
}

function lockDeck (button) {
    if (button.innerHTML == '🔓') {
        button.innerHTML = '🔐'
        button.title ='Enable Editing'
        isDeckLocked = true
        LOG_normal('Locked deck')
    }
    else {
        button.innerHTML = '🔓'
        button.title ='Disable Editing'
        isDeckLocked = false
        LOG_normal('Unlocked deck')
    }
}
function importButtonHover (button) {
    button.innerHTML = ''
    button.appendChild(createElement('button', '📂', {
        'title': 'Import Saved Deck',
        'class': 'deckSubButton',
        'onclick': 'importDeckLocalStorage()',
        'style': 'width: calc(100%/2)'
    }))
    button.appendChild(createElement('button', '📋', {
        'title': 'Import Deck From Clipboard',
        'class': 'deckSubButton',
        'onclick': 'importDeckClipboard()',
        'style': 'width: calc(100%/2)'
    }))
}

async function importDeckClipboard () {
    var text
    var encounteredError = false
    try {
        text = await navigator.clipboard.readText().catch(error => {LOG_alertError(error); encounteredError = true})
        if (encounteredError == true) {
            return
        }
    }
    catch {
        LOG_error('This browser does not support importing from clipboard.')
        return
    }
    importDeck(text)
}
function importDeckLocalStorage () {
    var savedDecks = Object.keys(localStorage)
    var key = prompt('Which deck would you like to load?\n\n' + savedDecks.join('\n'), savedDecks[0])
    if (key) {
        importDeck(localStorage[key])
    }
}

async function importDeck (text) {
    if (isDeckLocked == true) {
        LOG_alertNormal('Editing deck is locked.')
        return
    }
    else if(setsLoaded == false) {
        LOG_alertNormal('Please wait for a few seconds for sets to load.')
        return
    }

    text = text.split('\n')
    var cardsToSearch = []
    for (i=0; i<text.length; i++) {
        text[i] = text[i].replace('(', '').replace(')', '')
        var line = text[i].split(' ')

        //remove * from beginning of line
        if (line[0] == '*') {
            line.shift()
        }

        //format line
        if (isNaN(Number(line[0])) || line.length < 4) {
            continue
        }
        else if (line.length == 4) {
            for (basicEnergy in basicEnergies) {
                if (line[1].toLowerCase() == basicEnergy) {
                    line[3] = basicEnergies[basicEnergy][0]
                    line.push(basicEnergies[basicEnergy][1])
                }
            }
        }
        else if (line.length == 5 && line[2] == 'Energy' && line[3] == 'Energy') {
            for (basicEnergy in basicEnergies) {
                if (line[1].toLowerCase() == basicEnergy) {
                    line[3] = basicEnergies[basicEnergy][0]
                    line[4] = basicEnergies[basicEnergy][1]
                }
            }
        }

        var setCode = line[line.length -2].toLowerCase()
        var setNumber = line[line.length -1]

        //set code translation
        for (input in setIdTranslations) {
            if (setCode == input) {
                setCode = setIdTranslations[input]
                break
            }
        }

        var brokenSets = {
            'swshp': {
                'prefix': 'SWSH',
                'min-length': 3,
                'overflow': 0
            },
            'smp': {
                'prefix': 'SM',
                'min-length': 2,
                'overflow': 0
            },
            'xyp': {
                'prefix': 'XY',
                'min-length': 2,
                'overflow': 0
            },
            'bwp': {
                'prefix': 'BW',
                'min-length': 2,
                'overflow': 0
            },
            'hsp': {
                'prefix': 'HGSS',
                'min-length': 2,
                'overflow': 0
            },
            'dpp': {
                'prefix': 'DP',
                'min-length': 2,
                'overflow': 0
            },
            'swsh45': {
                'prefix': 'SV',
                'min-length': 3,
                'overflow': 73,
                'subset': 'swsh45sv'
            },
            'bw11': {
                'prefix': 'RC',
                'min-length': 1,
                'overflow': 115
            },
            'g1': {
                'prefix': 'RC',
                'min-length': 1,
                'overflow': 100
            }
        }

        for (key in brokenSets) {
            if (setCode == key && !setNumber.includes(brokenSets[key]['prefix']) && Number(setNumber) > brokenSets[key]['overflow']) {
                const brokenSet = brokenSets[key]
                setNumber = String(Number(setNumber) - brokenSet['overflow'])
                while (setNumber.length < brokenSet['min-length']) {
                    setNumber = '0' + setNumber
                }    
                setNumber = brokenSet['prefix'] + setNumber
            }
        }

        //shiny vault
        if (setCode == 'swsh45' && setNumber.includes('SV')) {
            setCode = 'swsh45sv'
        }

        //RESHIRAM & ZEKROM PROMO FIX
        if (setCode == 'bwp' && setNumber == 'BW04') {
            setNumber = 'BW004'
        }
        else if (setCode == 'bwp' && setNumber == 'BW05') {
            setNumber = 'BW005'
        }

        cardsToSearch.push({
            'id': `${setCode}-${setNumber}`,
            'count': Number(line[0])
        })
    }

    var importedCorrectly = true
    var overwriteDeck = true
    if (cardsToSearch.length == 0) {
        LOG_alertError('No cards were found on the clipboard:\n\n' + text)
    }
    else if (deckCards.firstChild && !confirm('Would you like to overwrite the existing deck?')) {
        if (confirm('Are you sure you want to import new cards? (This will add cards on top of the existing deck)')) {
            overwriteDeck = false
        }
        else {
            return
        }
    }
    //begin import
    else {
        var url = 'https://api.pokemontcg.io/v2/cards?q='
        cardIDs = []
        for (i=0; i<cardsToSearch.length; i++) {
            // REMOVING NEWLINES
            cardsToSearch[i]['id'] = cardsToSearch[i]['id'].replace(/[\r\n]+/gm, '')
            cardIDs.push(cardsToSearch[i]['id'])
        }
        var url = `https://api.pokemontcg.io/v2/cards?q=id:${cardIDs.join('+OR+id:')}+`

        const response = await fetchCards(url)

        var cardData
        //if response did not contain card data
        if (!response['cards']) {
            LOG_alertNormal('The deck you tried to import was malformed:\n\n' + text)
        }
        else {
            cardData = response['cards']
        }

        //match requests to fetched data
        var removedCards = false

        for (i=0; i<cardsToSearch.length; i++) {
            var newCard = cardData.filter(function(card) {
                return card['id'] == cardsToSearch[i]['id']
            })[0]
            if (newCard) {
                if (overwriteDeck == true && removedCards == false) {
                    removeDeckCards(true)
                    removedCards = true
                }
                addDeckCard(createCard(newCard), cardsToSearch[i]['count'])
            }
            else {
                LOG_error(`Failed to import ${cardsToSearch[i]['id']}`)
                importedCorrectly = false 
            }
        }
    }
    if (importedCorrectly == false) {
        LOG_alertNormal('One or more cards failed to import. See the console for more details.')
    }
}

function exportButtonHover (button) {
    button.innerHTML = ''
    button.appendChild(createElement('button', '💾', {
        'title': 'Save Deck',
        'class': 'deckSubButton',
        'onclick': 'exportDeckText("localStorage")',
        'style': 'width: calc(100%/3)'
    }))
    button.appendChild(createElement('button', '📷', {
        'title': 'Export Deck As Image Or Gif',
        'class': 'deckSubButton',
        'onclick': 'exportDeckImage()',
        'style': 'width: calc(100%/3)'
    }))
    button.appendChild(createElement('button', '📋', {
        'title': 'Copy Deck To Clipboard',
        'class': 'deckSubButton',
        'onclick': 'exportDeckText("clipboard")',
        'style': 'width: calc(100%/3)'
    }))
}

function exportDeckText (mode) {
    var cards = deckCards.childNodes
    if (cards.length == 0) {
        LOG_alertNormal('Use this button to export the deck to your clipboard.')
        return
    }

    var text = []
    for (i=0; i<cards.length; i++) {
        var dataContainer = cards[i].getElementsByClassName(['data'])[0]
        var count = cards[i].getElementsByClassName('individualCardCount')[0].value
        var name = dataContainer.getAttribute('name')
        var code
        if (dataContainer.getAttribute('set')) {
            //if ptcgoCode
            if (JSON.parse(dataContainer.getAttribute('set'))['ptcgoCode']) {
                code = JSON.parse(dataContainer.getAttribute('set'))['ptcgoCode']
                if (ptcgoCodeTranslations[code]) {
                    code = ptcgoCodeTranslations[code]
                }
            }
            //else, use ID
            else {
                code = JSON.parse(dataContainer.getAttribute('set'))['id'].toUpperCase()
            }
            var number = dataContainer.getAttribute('number')
            text.push(
                `${count} ${name} ${code} ${number}`
            )
        }
        else {
            text.push(
                `${count} ${name}`
            )
        }

    }
    text = text.join('\n')

    if (mode == 'clipboard') {
        var dummy = document.createElement('textarea');
        document.body.appendChild(dummy);
        dummy.value = text;
        dummy.select();
        document.execCommand('copy');
        document.body.removeChild(dummy);

        LOG_alertNormal('Deck copied to clipboard.\n\n' + text)
    }
    else if (mode == 'localStorage') {
        var savedDecks = Object.keys(localStorage)
        var key = prompt(savedDecks.join('\n') + '\n\nSave new deck using name:', 'New Deck 1')
        if (key) {
            localStorage.setItem(key, text)
        }
    }
}

function optimizeCardPlacement (n, a, b, spacing, A, B) {
    a = a + spacing
    b = b + spacing

    var best_scale = 0
    var best_cardsPerRow
    var best_cardsPerColumn

    var cardsPerRow = 0
    var cardsPerColumn = 0

    while (cardsPerRow < n) {
        cardsPerRow++
        cardsPerColumn = Math.floor((n + cardsPerRow - 1) / cardsPerRow)
        var scale = Math.min(A / (a * cardsPerRow), B / (b * cardsPerColumn))
        if (scale > best_scale) {
            best_scale = scale
            best_cardsPerRow = cardsPerRow
            best_cardsPerColumn = cardsPerColumn
        }
    }

    return {
        'scale': best_scale,
        'cards_per_row': best_cardsPerRow,
        'cards_per_column': best_cardsPerColumn,
        'horizontal_offset': (A - best_cardsPerRow * best_scale * a) / 2,
        'vertical_offset': (B - best_cardsPerColumn * best_scale * b) / 2
    }
}

function exportDeckImage () {
    // HERE
    console.log('EXPORTING DECK IMAGE')
    if (document.getElementById('exportCanvas')) {
        document.getElementById('exportCanvas').remove()
    }

    var exportCanvas = document.createElement('canvas')
    exportCanvas.id = 'exportCanvas'
    document.body.appendChild(exportCanvas)
    exportCanvas.setAttribute('style', 'position: absolute; pointer-events: none; transform: scale(0.25);')
    // exportCanvas.setAttribute('style', 'position: absolute; visibility: hidden')
    var ctx = exportCanvas.getContext('2d')
    ctx.imageSmoothingEnabled = false

    var height = 1080
    var width = 1920
    exportCanvas.height = height
    exportCanvas.width = width
    var borderSize = height/20
    exportCanvas.borderSize = borderSize

    // Draw Pokégear

        // background
    ctx.beginPath()
    ctx.fillStyle = '#26225d'
    ctx.rect(0, 0, width, height)
    ctx.fill()
    ctx.closePath()

        // top large circle
    ctx.beginPath()
    ctx.fillStyle = '#8690b0'
    ctx.arc(width/2, 0, width/5, 0, 2 * Math.PI, false);
    ctx.fill()
    ctx.closePath()

        // bottom large circle
    ctx.beginPath()
    ctx.fillStyle = '#8690b0'
    ctx.arc(width/2, height, width/5, 0, 2 * Math.PI, false);
    ctx.fill()
    ctx.closePath()

        // cyan
    var radius = height/20
    var innerHeight = height - borderSize*2
    var innerWidth = width - borderSize*2
    ctx.beginPath()
    ctx.fillStyle = '#6dcacd'
    ctx.moveTo(borderSize + radius, borderSize);
    ctx.lineTo(borderSize + innerWidth - radius, borderSize);
    ctx.quadraticCurveTo(borderSize + innerWidth, borderSize, borderSize + innerWidth, borderSize + radius);
    ctx.lineTo(borderSize + innerWidth, borderSize + innerHeight - radius);
    ctx.quadraticCurveTo(borderSize + innerWidth, borderSize + innerHeight, borderSize + innerWidth - radius, borderSize + innerHeight);
    ctx.lineTo(borderSize + radius, borderSize + innerHeight);
    ctx.quadraticCurveTo(borderSize, borderSize + innerHeight, borderSize, borderSize + innerHeight - radius);
    ctx.lineTo(borderSize, borderSize + radius);
    ctx.quadraticCurveTo(borderSize, borderSize, borderSize + radius, borderSize);
    ctx.fill()
    ctx.closePath()

        // light blue stripe 1
    ctx.beginPath()
    ctx.fillStyle = '#afe0eb'
    ctx.moveTo(borderSize + innerWidth * 3/32, borderSize + innerHeight)
    ctx.lineTo(borderSize + innerWidth * 3/32 + innerHeight * 5/6, borderSize)
    ctx.lineTo(borderSize + innerWidth * 3/32 + innerHeight * 5/6 + innerWidth/4, borderSize)
    ctx.lineTo(borderSize + innerWidth * 3/32 + innerWidth/4, borderSize + innerHeight)
    ctx.lineTo(borderSize + innerWidth * 3/32, borderSize + innerHeight)
    ctx.fill()
    ctx.closePath()

        // light blue stripe 2
    ctx.beginPath()
    ctx.fillStyle = '#afe0eb'
    ctx.moveTo(borderSize + innerWidth * 12/32, borderSize + innerHeight)
    ctx.lineTo(borderSize + innerWidth * 12/32 + innerHeight * 5/6, borderSize)
    ctx.lineTo(borderSize + innerWidth * 12/32 + innerHeight * 5/6 + innerWidth/16, borderSize)
    ctx.lineTo(borderSize + innerWidth * 12/32 + innerWidth/16, borderSize + innerHeight)
    ctx.lineTo(borderSize + innerWidth * 12/32, borderSize + innerHeight)
    ctx.fill()
    ctx.closePath()
    
    var cards = document.getElementById('deckCards').children
    var cardSpacing = 8.8 * 30/1024
    var efficientPlacement = optimizeCardPlacement(cards.length, 6.3, 8.8, cardSpacing, width - borderSize * 2, height - borderSize * 2)
    var scale = efficientPlacement['scale']
    var efficientCardWidth = 6.3 * scale
    var efficientCardHeight = 8.8 * scale
    var efficientCardSpacing = cardSpacing * scale
    var cardsPerRow = efficientPlacement['cards_per_row']

    // remainders
    var cardRemainder = (cardsPerRow * efficientPlacement['cards_per_column']) - cards.length
    var finalRow = cards.length - cardsPerRow + cardRemainder

    var verticalOffset = efficientPlacement['vertical_offset'] + borderSize
    var horizontalOffset = efficientPlacement['horizontal_offset'] + borderSize
    var completed = cards.length
    for (i=0; i<cards.length; i++) {
        var tempCanvas = document.createElement('canvas')
        document.body.appendChild(tempCanvas)
// switch for upload
        // tempCanvas.setAttribute('style', 'position: absolute; transform: translateY(100px) scale(0.5)')
        tempCanvas.setAttribute('style', 'position: absolute; visibility: hidden')
        var tempCtx = tempCanvas.getContext('2d')
        tempCtx.imageSmoothingEnabled = false

        var img = new Image()
        img.i = i
        img.canvas = tempCanvas
        img.exportCanvas = exportCanvas
        img.borderSize = borderSize
        if (cards[i].getElementsByClassName('holo')[0]) {
            img.holo = true
        }
        else {
            img.holo = false
        }
        img.onload = function () {
            var imgWidth = this.width
            var imgHeight = this.height
            var imgCanvas = this.canvas
            var imgCtx = imgCanvas.getContext('2d')
            var exportCanvas = this.exportCanvas
            imgCanvas.width = imgWidth
            imgCanvas.height = imgHeight

            var imgRadius = imgHeight/26

            imgCtx.moveTo(imgRadius, 0)
            imgCtx.lineTo(imgWidth - imgRadius, 0)
            imgCtx.quadraticCurveTo(imgWidth, 0, imgWidth, imgRadius)
            imgCtx.lineTo(imgWidth, imgHeight - imgRadius)
            imgCtx.quadraticCurveTo(imgWidth, imgHeight, imgWidth - imgRadius, imgHeight)
            imgCtx.lineTo(imgRadius, imgHeight)
            imgCtx.quadraticCurveTo(0, imgHeight, 0, imgHeight - imgRadius)
            imgCtx.lineTo(0, imgRadius)
            imgCtx.quadraticCurveTo(0, 0, imgRadius, 0)
            imgCtx.closePath()
            imgCtx.clip()

            imgCtx.drawImage(this, 0, 0)

            if (this.holo == true) {
                var holoImg = new Image()
                holoImg.i = this.i
                holoImg.canvas = imgCanvas
                holoImg.exportCanvas = exportCanvas
                holoImg.borderSize = this.borderSize
                holoImg.onload = function () {
                    var holoImgCanvas = this.canvas
                    var holoImgCtx = holoImgCanvas.getContext('2d')
                    holoImgCtx.globalAlpha = 0.4;
                    holoImgCtx.drawImage(this, 0, 0, holoImgCanvas.height * this.width / this.height, holoImgCanvas.height)
                    // add finished card to main export canvas
                    if (this.i < finalRow) {
                        // holoImgCanvas, card spacing + horizontal shift, card spacing + vertical shift, width, height
                        ctx.drawImage(holoImgCanvas, efficientCardSpacing/2 + ((this.i % cardsPerRow) * efficientCardSpacing) + (this.i % cardsPerRow) * efficientCardWidth + horizontalOffset, efficientCardSpacing/2 + (Math.floor(this.i/cardsPerRow) * efficientCardSpacing) + Math.floor(this.i/cardsPerRow) * efficientCardHeight + verticalOffset, efficientCardWidth, efficientCardHeight)
                    }
                    else {
                        // holoImgCanvas, card spacing + horizontal shift + remainder shift, card spacing + vertical shift, width, height
                        ctx.drawImage(holoImgCanvas, efficientCardSpacing/2 + ((this.i % cardsPerRow) * efficientCardSpacing) + (this.i % cardsPerRow) * efficientCardWidth + horizontalOffset + (efficientCardWidth * cardRemainder)/2, efficientCardSpacing/2 + (Math.floor(this.i/cardsPerRow) * efficientCardSpacing) + Math.floor(this.i/cardsPerRow) * efficientCardHeight + verticalOffset, efficientCardWidth, efficientCardHeight)
                    }
                    holoImgCanvas.remove()
                    completed--
                    if (completed == 0) {
                        finishExportDeckImage(exportCanvas)
                    }
                }
                holoImg.crossOrigin = 'Anonymous'
// switch for upload
                // holoImg.src = 'https://images.pokemontcg.io/dp1/130_hires.png'
                holoImg.src = 'images/holo_overlay.png'
            }
            else {
                // add finished card to main export canvas
                if (this.i < finalRow) {
                    // imgCanvas, card spacing + horizontal shift, card spacing + vertical shift, width, height
                    ctx.drawImage(imgCanvas, efficientCardSpacing/2 + ((this.i % cardsPerRow) * efficientCardSpacing) + (this.i % cardsPerRow) * efficientCardWidth + horizontalOffset, efficientCardSpacing/2 + (Math.floor(this.i/cardsPerRow) * efficientCardSpacing) + Math.floor(this.i/cardsPerRow) * efficientCardHeight + verticalOffset, efficientCardWidth, efficientCardHeight)
                }
                else {
                    // imgCanvas, card spacing + horizontal shift + remainder shift, card spacing + vertical shift, width, height
                    ctx.drawImage(imgCanvas, efficientCardSpacing/2 + ((this.i % cardsPerRow) * efficientCardSpacing) + (this.i % cardsPerRow) * efficientCardWidth + horizontalOffset + ((efficientCardWidth + efficientCardSpacing) * cardRemainder)/2, efficientCardSpacing/2 + (Math.floor(this.i/cardsPerRow) * efficientCardSpacing) + Math.floor(this.i/cardsPerRow) * efficientCardHeight + verticalOffset, efficientCardWidth, efficientCardHeight)
                }
                imgCanvas.remove()
                completed--
                if (completed == 0) {
                    finishExportDeckImage(exportCanvas)
                }
            }
        }
        img.crossOrigin = 'Anonymous'
        img.src = JSON.parse(cards[i].getElementsByClassName('data')[0].getAttribute('images'))['large']
    }
}

function finishExportDeckImage (exportCanvas) {
    var ctx = exportCanvas.getContext('2d')
    var height = exportCanvas.height
    var width = exportCanvas.width
    var borderSize = exportCanvas.borderSize

        // top small circle shadow
    ctx.beginPath()
    ctx.fillStyle = '#b1e2f8'
    ctx.arc(width/2, height/150, borderSize*4/3, 0, 2 * Math.PI, false);
    ctx.fill()
    ctx.closePath()

        // top small circle
    ctx.beginPath()
    ctx.fillStyle = '#d0edfc'
    ctx.arc(width/2, -height/150, borderSize*4/3, 0, 2 * Math.PI, false);
    ctx.fill()
    ctx.closePath()

        // bottom small circle shadow
    ctx.beginPath()
    ctx.fillStyle = '#b1e2f8'
    ctx.arc(width/2, height + height/150, borderSize*4/3, 0, 2 * Math.PI, false);
    ctx.fill()
    ctx.closePath()

        // bottom small circle
    ctx.beginPath()
    ctx.fillStyle = '#d0edfc'
    ctx.arc(width/2, height - height/150, borderSize*4/3, 0, 2 * Math.PI, false);
    ctx.fill()
    ctx.closePath()

    downloadTempButton('pokégear-export.png', exportCanvas.toDataURL('image/png').replace('image/png', 'image/octet-stream'))
}

function sortDeck () {
    if (isDeckLocked == true) {
        LOG_alertNormal('Editing deck is locked.')
        return
    }
    var sortTypes = {
        'pokemon': [],
        'supporter': [],
        'item': [],
        'tool': [],
        'flare-tool': [],
        'stadium': [],
        'acespec': [],
        'specialEnergy': [],
        'basicEnergy': [],
        'unknown': []
    }
    for (i=0; i<deckCards.children.length; i++) {
        var card = deckCards.children[i]
        var dataContainer = card.getElementsByClassName('data')[0]
        var supertype = dataContainer.getAttribute('supertype')
        var subtypes = JSON.parse(dataContainer.getAttribute('subtypes'))
        var rules = JSON.parse(dataContainer.getAttribute('rules'))
        if (supertype == 'Pokémon') {
            sortTypes['pokemon'].push(card)
            continue
        }
        else if (supertype && supertype == 'Trainer') {
            if (subtypes && subtypes.includes('Supporter')) {
                sortTypes['supporter'].push(card)
                continue
            }
            else if (!subtypes) {
                sortTypes['item'].push(card)
                continue
            }
            else if (rules && rules.includes("You can't have more than 1 ACE SPEC card in your deck.")) {
                sortTypes['acespec'].push(card)
                continue
            }
            else if (subtypes && subtypes.includes('Item')) {
                sortTypes['item'].push(card)
                continue
            }
            else if (subtypes && subtypes.includes("Rocket's Secret Machine")) {
                sortTypes['item'].push(card)
                continue
            }
            else if (subtypes && subtypes.includes('Pokémon Tool')) {
                sortTypes['tool'].push(card)
                continue
            }
            else if (subtypes && subtypes.includes('Technical Machine')) {
                sortTypes['tool'].push(card)
                continue
            }
            else if (subtypes && subtypes.includes('Stadium')) {
                sortTypes['stadium'].push(card)
                continue
            }
            else if (subtypes && subtypes.includes('Pokémon Tool F')) {
                sortTypes['flare-tool'].push(card)
                continue
            }
        }
        else if (supertype && supertype == 'Energy') {
            if (subtypes && subtypes.includes('Special')) {
                sortTypes['specialEnergy'].push(card)
                continue
            }
            else if (subtypes && subtypes.includes('Basic Energy')) {
                sortTypes['basicEnergy'].push(card)
                continue
            }
        }
        sortTypes['unknown'].push(card)
    }

    for (sortType in sortTypes) {
        sortTypes[sortType] = sortTypes[sortType].sort(function(a,b){
            return Number(b.getElementsByClassName('individualCardCount')[0].value) - Number(a.getElementsByClassName('individualCardCount')[0].value) || a.getElementsByClassName('data')[0].getAttribute('name').localeCompare(b.getElementsByClassName('data')[0].getAttribute('name'))
        })
    }

    var evolutions = [
        ['Stage 2'],
        ['BREAK'],
        ['Level-Up']
    ]

    //filter out evolutions
    for (i=0; i<evolutions.length; i++) {
        // find higher stage evolutions
        evolutions[i][1] = sortTypes['pokemon'].filter(function(card) {
            var cardData = card.getElementsByClassName('data')[0]
            var subtypes = cardData.getAttribute('subtypes')
            return subtypes.includes(evolutions[i][0])
        })
        sortTypes['pokemon'] = sortTypes['pokemon'].filter(function(card) {
            var cardData = card.getElementsByClassName('data')[0]
            var subtypes = cardData.getAttribute('subtypes')
            return !subtypes.includes(evolutions[i][0])
        })
    }
    //find lower stage evolutions
    evolutions.unshift(['Other', sortTypes['pokemon'].filter(function(card) {
        var cardData = card.getElementsByClassName('data')[0]
        return cardData.getAttribute('evolvesfrom')
    })])
    sortTypes['pokemon'] = sortTypes['pokemon'].filter(function(card) {
        var cardData = card.getElementsByClassName('data')[0]
        return !cardData.getAttribute('evolvesfrom')
    })

    //add back evolutions
    for (i=0; i<evolutions.length; i++) {
        evolutions[i][1] = evolutions[i][1].reverse()
        for (j=0; j<evolutions[i][1].length; j++) {
            var preEvolutionIndex = null
            for (k=0; k<sortTypes['pokemon'].length; k++) {
                var name = sortTypes['pokemon'][k].getElementsByClassName('data')[0].getAttribute('name')
                if (name.includes(' δ')) {
                    name = name.split(' δ')[0]
                }
                if (name == evolutions[i][1][j].getElementsByClassName('data')[0].getAttribute('evolvesfrom')) {
                    preEvolutionIndex = k
                }
            }
            if (preEvolutionIndex != null) {
                sortTypes['pokemon'].splice(preEvolutionIndex+1, 0, evolutions[i][1][j])
            }
            else {
                sortTypes['pokemon'].push(evolutions[i][1][j])
            }
        }
    }

    var newDeck = sortTypes['pokemon']
    newDeck = newDeck.concat(sortTypes['supporter'])
    newDeck = newDeck.concat(sortTypes['item'])
    newDeck = newDeck.concat(sortTypes['tool'])
    newDeck = newDeck.concat(sortTypes['flare-tool'])
    newDeck = newDeck.concat(sortTypes['stadium'])
    newDeck = newDeck.concat(sortTypes['acespec'])
    newDeck = newDeck.concat(sortTypes['specialEnergy'])
    newDeck = newDeck.concat(sortTypes['basicEnergy'])
    newDeck = newDeck.concat(sortTypes['unknown'])

    deckCards.innerHTML = null

    for (i=0; i<newDeck.length; i++) {
        deckCards.appendChild(newDeck[i])
    }
}

function changeCardScale (value) {
    value = Number(value)
    if (value < 0) {
        value = -1 / (value -1)
    }
    else {
        value = value + 1
    }
    document.documentElement.style.setProperty('--cardScale', value);
}

function deleteButtonHover (button) {
    button.innerHTML = ''
    button.appendChild(createElement('button', '📂', {
        'title': 'Delete Saved Deck',
        'class': 'deckSubButton',
        'onclick': 'deleteSavedDeck()',
        'style': 'width: calc(100%/2)'
    }))
    button.appendChild(createElement('button', '🗑', {
        'title': 'Delete Deck',
        'class': 'deckSubButton',
        'onclick': 'deleteDeck()',
        'style': 'width: calc(100%/2)'
    }))
}

function deleteSavedDeck () {
    var savedDecks = Object.keys(localStorage)
    var key = prompt('Delete saved deck:\n\n' + savedDecks.join('\n'), '')
    if (key) {
        localStorage.removeItem(key)
        alert(key + ' has been deleted.')
    }
}

function deleteDeck () {
    if (!deckCards.firstChild) {
        LOG_alertNormal('There are no cards to delete.')
    }
    else if (confirm('Are you sure you want to delete the deck?')) {
        removeDeckCards(false)
    }
}

function removeDeckCards (immediate) {
    if (immediate == true) {
        deckCards.innerHTML = null
    }
    else {
        for (i=0; i<deckCards.children.length; i++) {
            animateRemoveElement(deckCards.children[i], 'fadeOut')
        }
    }
    deckCardCount.value = 0;
    deckCardCount.setAttribute('style', 'color: white')
}
