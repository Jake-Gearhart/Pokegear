ELEMENTS.filters.open = () => {
    ELEMENTS.filters.classList.add("open")
    ELEMENTS.sidebar.open()

    const filterCardRect = ELEMENTS.filterCard.getBoundingClientRect()
    document.root.style.setProperty('--filter-card-width-percent', `${filterCardRect.width/100}px`)
    document.root.style.setProperty('--filter-card-height-percent', `${filterCardRect.height/100}px`)
}

ELEMENTS.filters.close = () => {
    ELEMENTS.filters.classList.remove("open")
}

ELEMENTS.filters.mouseLeave = (event) => {
    if (event.x > 0 && event.y > 0 && event.x < window.innerWidth && event.y < window.innerHeight) {
        ELEMENTS.filters.close()
    }
}

ELEMENTS.filterCardFavoritesButton.enabled = false
ELEMENTS.filterCardFavoritesButton.click = () => {
    if (ELEMENTS.filterCardFavoritesButton.enabled == false) {
        ELEMENTS.filterCardFavoritesButton.enabled = true
        ELEMENTS.filterCardFavoritesButton.innerHTML = '★'
    }
    else {
        ELEMENTS.filterCardFavoritesButton.enabled = false
        ELEMENTS.filterCardFavoritesButton.innerHTML = '☆'
    }
    getSidebarCards()
}