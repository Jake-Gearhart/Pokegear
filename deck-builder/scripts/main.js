function resizeWindow () {
    sidebar.setTab()
}
window.addEventListener('resize', resizeWindow)
resizeWindow()

let previousMousePos = { x: 0, y: 0 }
window.addEventListener('mousemove', (event) => {
    const mouseElement = document.elementFromPoint(event.x, event.y)
    if (mouseElement) {
        const hoveredCard = mouseElement.closest("pokemon-card")
        if (hoveredCard && (event.x != previousMousePos.x || event.y != previousMousePos.y)) { hoveredCard.hover(event) }
    }

    //update previous mouse position
    previousMousePos.x = event.x
    previousMousePos.y = event.y
})

window.addEventListener('keydown', (event) => {
    if (event.key == "f") {
        sidebar.toggleFullscreen()
    }
    else if (event.key == "i") {
        const hoveredCard = document.getElementsByClassName("hovered-card")[0]
        if (hoveredCard) { 
            const rect = hoveredCard.getBoundingClientRect()
            console.log(`x: ${rect.x}, y: ${rect.y}, width: ${rect.width}, height: ${rect.height}`)
            console.log(hoveredCard.data)
        }
    }
    else if (event.key == "h") {
        toggleCardHolo()
    }
    else if (event.key == "c") {
        console.log(sidebarCardContainer.getCardsPerRow())
    }
    else if (event.key == "m") {
        cardsFaceMouse = !cardsFaceMouse
        console.log(`Cards Face Mouse = ${cardsFaceMouse}`)
    }
})

function rng (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function toggleCardHolo () {
    const currentValue = getComputedStyle(documentRoot).getPropertyValue("--card-holo-display")
    if (currentValue == 'inline-block') {
        documentRoot.style.setProperty("--card-holo-display", "none");
        console.log("Card Holo Effect Off")
    }
    else {
        documentRoot.style.setProperty("--card-holo-display", "inline-block");
        console.log("Card Holo Effect On")
    }
}