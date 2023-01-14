const mainPage = document.getElementById("main-page")
const focused = document.getElementById("focused")
const focusedScroll = document.getElementById("focused-scroll")
const focusedCardsContainer = document.getElementById("focused-cards-container")
const sidebar = document.getElementById("sidebar")
const sidebarTab = document.getElementById("sidebar-tab")
const sidebarTopContainer = document.getElementById('sidebar-top-container')
const sidebarTopFullscreenButton = document.getElementById('sidebar-top-fullscreen-button')
const sidebarCardsContainer = document.getElementById("sidebar-cards-container")
const filters = document.getElementById("filters")
const filterCard = document.getElementById("filter-card")
const apiKey = '97e68183-f5f5-4354-8ca5-60925a4a7752'

const documentRoot = document.querySelector(":root")

const mousePos = {'x': 0, 'y': 0}
let latestWheelEvent
let cardsFaceMouse = true
const heldKeys = {'Control': false}
const mostRecentClickEvent = {'type': null, 'wait': false}

sidebarCardsContainer.totalCardCount = 0
sidebarCardsContainer.fetchedPages = []
sidebarCardsContainer.queueNumber = 0
sidebarCardsContainer.currentFilters = []