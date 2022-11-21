filters.open = () => {
    filters.classList.add("open")
    sidebar.open()
}

filters.close = () => {
    filters.classList.remove("open")
}

filters.mouseLeave = (event) => {
    if (event.x > 0 && event.y > 0 && event.x < window.innerWidth && event.y < window.innerHeight) {
        filters.close()
    }
}