filters.open = () => {
    filters.classList.add("open")
    sidebar.open()

    const filterCardRect = filterCard.getBoundingClientRect()
    documentRoot.style.setProperty('--filter-card-width-percent', `${filterCardRect.width/100}px`)
    documentRoot.style.setProperty('--filter-card-height-percent', `${filterCardRect.height/100}px`)
}

filters.close = () => {
    filters.classList.remove("open")
}

filters.mouseLeave = (event) => {
    if (event.x > 0 && event.y > 0 && event.x < window.innerWidth && event.y < window.innerHeight) {
        filters.close()
    }
}