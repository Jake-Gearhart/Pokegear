document.root = document.querySelector(":root")

Math.clamp = (value, min, max) => Math.min(Math.max(value, min), max)

const ELEMENTS = {
    mainPage: document.getElementById("main-page"),
    deckCardsContainer: document.getElementById("deck-cards-container"),
    focused: document.getElementById("focused"),
    focusedCardsContainer: document.getElementById("focused-cards-container"),
    sidebar: document.getElementById("sidebar"),
    sidebarTab: document.getElementById("sidebar-tab"),
    sidebarTopContainer: document.getElementById('sidebar-top-container'),
    sidebarTopFullscreenButton: document.getElementById('sidebar-top-fullscreen-button'),
    sidebarCardsContainer: document.getElementById("sidebar-cards-container"),
    filters: document.getElementById('filters'),
    filterCard: document.getElementById('filter-card'),
    totalCardsInDeck: document.getElementById("total-cards-in-deck"),
    focusedPrice: document.getElementById('focused-price'),
    filterCardFavoritesButton: document.getElementById('filter-card-favorites-button')
}

const GLOBAL = {
    cardsFaceMouse: true,

    apiKey: '97e68183-f5f5-4354-8ca5-60925a4a7752',

    get cardWidth () { return getComputedStyle(document.documentElement).getPropertyValue('--card-width') },
    get cardHeight () { return getComputedStyle(document.documentElement).getPropertyValue('--card-height') },

    mousePos: {'x': 0, 'y': 0},
    mouseTarget: null,
    latestClickEvent: {'type': null, 'wait': false},
    latestWheelEvent: null,
    heldKeys: {'Control': false},

    cardDragTarget: null,

    cardsByUrl: {},
    // cardsByUrl: {
    //     'url': ['card1', 'card2']
    // },
    setDataFromResponse: (response) => {
        if (GLOBAL.cardsByUrl[response.url]) {
            GLOBAL.cardsByUrl[response.url].forEach(card => {
                card.setData(response.cards[card.dataSource.index])
            })
        }
    },
    localStorageHandler: {
        set: function(obj, prop, value) {
            obj[prop] = value;
            for (const key in GLOBAL.localStorage) { //modify browser localStorage
                try {
                    localStorage[key] = JSON.stringify(GLOBAL.localStorage[key])
                    console.log('Local storage updated', localStorage)
                } catch {
                    console.error('Failed to update local storage')
                }
            }
            return true;
        },
        get: function(target, prop) {
            const value = Reflect.get(target, prop);
            if (typeof value === "object") {
                return new Proxy(value, GLOBAL.localStorageHandler);
            }
            return value;
        }
    }
}
let initialLocalStorage = {}
try {
    initialLocalStorage = Object.fromEntries(Object.entries(localStorage).map(([key, value]) => [key, JSON.parse(value)]))
} catch {}
GLOBAL.localStorage = new Proxy(initialLocalStorage, GLOBAL.localStorageHandler);

if (!GLOBAL.localStorage['deck-builder']) { GLOBAL.localStorage['deck-builder'] = {} }
if (!GLOBAL.localStorage['deck-builder']['favorite-card-ids']) { GLOBAL.localStorage['deck-builder']['favorite-card-ids'] = [] }

ELEMENTS.sidebarCardsContainer.totalCardCount = 0
ELEMENTS.sidebarCardsContainer.fetchedPages = []
ELEMENTS.sidebarCardsContainer.queueNumber = 0
ELEMENTS.sidebarCardsContainer.currentFilters = []

// ELEMENTS.deckCardsContainer.cardsByID = {}

// ELEMENTS.deckCardsContainer._total = {
//     'Pokémon': {
//         'Basic': 0,
//         'Other': 0
//     },
//     'Trainer': {
//         'Supporter': 0,
//         'Item': 0,
//         'Pokémon Tool': 0,
//         'Stadium': 0,
//         'Other': 0
//     },
//     'Energy': {
//         'Special': 0,
//         'Basic': 0,
//         'Other': 0
//     },
//     'Other': 0
// }

// ELEMENTS.deckCardsContainer.total = {
//     'Pokémon': {
//         set 'Basic' (value) { ELEMENTS.deckCardsContainer._total['Pokémon']['Basic'] = value; ELEMENTS.deckCardsContainer.updateCardCounts() },
//         get 'Basic' () { return ELEMENTS.deckCardsContainer._total['Pokémon']['Basic'] },
//         set 'Other' (value) { ELEMENTS.deckCardsContainer._total['Pokémon']['Other'] = value; ELEMENTS.deckCardsContainer.updateCardCounts() },
//         get 'Other' () { return ELEMENTS.deckCardsContainer._total['Pokémon']['Other'] },
//         get all () { return ELEMENTS.deckCardsContainer.total['Pokémon']['Basic'] + ELEMENTS.deckCardsContainer.total['Pokémon']['Other'] }
//     },
//     'Trainer': {
//         set 'Supporter' (value) { ELEMENTS.deckCardsContainer._total['Trainer']['Supporter'] = value; ELEMENTS.deckCardsContainer.updateCardCounts() },
//         get 'Supporter' () { return ELEMENTS.deckCardsContainer._total['Trainer']['Supporter'] },
//         set 'Item' (value) { ELEMENTS.deckCardsContainer._total['Trainer']['Item'] = value; ELEMENTS.deckCardsContainer.updateCardCounts() },
//         get 'Item' () { return ELEMENTS.deckCardsContainer._total['Trainer']['Item'] },
//         set 'Pokémon Tool' (value) { ELEMENTS.deckCardsContainer._total['Trainer']['Pokémon Tool'] = value; ELEMENTS.deckCardsContainer.updateCardCounts() },
//         get 'Pokémon Tool' () { return ELEMENTS.deckCardsContainer._total['Trainer']['Pokémon Tool'] },
//         set 'Stadium' (value) { ELEMENTS.deckCardsContainer._total['Trainer']['Stadium'] = value; ELEMENTS.deckCardsContainer.updateCardCounts() },
//         get 'Stadium' () { return ELEMENTS.deckCardsContainer._total['Trainer']['Stadium'] },
//         set 'Other' (value) { ELEMENTS.deckCardsContainer._total['Trainer']['Other'] = value; ELEMENTS.deckCardsContainer.updateCardCounts() },
//         get 'Other' () { return ELEMENTS.deckCardsContainer._total['Trainer']['Other'] },
//         get all () { return ELEMENTS.deckCardsContainer.total['Trainer']['Supporter'] + ELEMENTS.deckCardsContainer.total['Trainer']['Item'] + ELEMENTS.deckCardsContainer.total['Trainer']['Pokémon Tool'] + ELEMENTS.deckCardsContainer.total['Trainer']['Stadium'] + ELEMENTS.deckCardsContainer.total['Trainer']['Other'] }
//     },
//     'Energy': {
//         set 'Special' (value) { ELEMENTS.deckCardsContainer._total['Energy']['Special'] = value; ELEMENTS.deckCardsContainer.updateCardCounts() },
//         get 'Special' () { return ELEMENTS.deckCardsContainer._total['Energy']['Special'] },
//         set 'Basic' (value) { ELEMENTS.deckCardsContainer._total['Energy']['Basic'] = value; ELEMENTS.deckCardsContainer.updateCardCounts() },
//         get 'Basic' () { return ELEMENTS.deckCardsContainer._total['Energy']['Basic'] },
//         set 'Other' (value) { ELEMENTS.deckCardsContainer._total['Energy']['Other'] = value; ELEMENTS.deckCardsContainer.updateCardCounts() },
//         get 'Other' () { return ELEMENTS.deckCardsContainer._total['Energy']['Other'] },
//         get all () { return ELEMENTS.deckCardsContainer.total['Energy']['Special'] + ELEMENTS.deckCardsContainer.total['Energy']['Basic'] + ELEMENTS.deckCardsContainer.total['Energy']['Other'] }
//     },
//     set 'Other' (value) { ELEMENTS.deckCardsContainer._total['Other'] = value; ELEMENTS.deckCardsContainer.updateCardCounts() },
//     get 'Other' () { return ELEMENTS.deckCardsContainer._total['Other'] },
//     get all () { return ELEMENTS.deckCardsContainer.total['Pokémon'].all + ELEMENTS.deckCardsContainer.total['Trainer'].all + ELEMENTS.deckCardsContainer.total['Energy'].all + ELEMENTS.deckCardsContainer.total['Other'] }
// }

// if (!localStorage.getItem('deck-builder')) {
//     console.log('Setting up localStorage[\'deck-builder\']')
//     localStorage.setItem('deck-builder', JSON.stringify({}))
// }
// let deckBuilderStorage = JSON.parse(localStorage.getItem('deck-builder'))

// if (!deckBuilderStorage['favorited-card-ids']) {
//     console.log('Setting up localStorage[\'deck-builder\'][\'favorited-card-ids\']')
//     localStorage.deckBuilder.favoritedCardIDs = []
// }