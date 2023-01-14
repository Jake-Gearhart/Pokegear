function resizeWindow () {
    sidebar.setTab()

    const filterCardRect = filterCard.getBoundingClientRect()
    documentRoot.style.setProperty('--filter-card-width-percent', `${filterCardRect.width/100}px`)
    documentRoot.style.setProperty('--filter-card-height-percent', `${filterCardRect.height/100}px`)
}
window.addEventListener('resize', resizeWindow)
resizeWindow()

window.addEventListener('touchstart', (event) => {
    mostRecentClickEvent.type = 'touch'
    mostRecentClickEvent.wait = true
})

window.addEventListener('mousemove', (event) => {
    if (mousePos.x == event.clientX && mousePos.y == event.clientY) { return }

    mousePos.x = event.clientX
    mousePos.y = event.clientY

    if (mostRecentClickEvent.type == 'touch') {
        if (mostRecentClickEvent.wait == true) { mostRecentClickEvent.wait = false }
        else { mostRecentClickEvent.type = 'click' }
    }

    if (mostRecentClickEvent.type != 'touch') {
        if (!focused.classList.contains('hidden') && focused.focusedCard) {
            focused.focusedCard.hover()
        }
        else {
            const card = event.target.closest('pokemon-card')
            if (card) { card.hover() }
        }
    }
})

window.addEventListener('wheel', (event) => {
    latestWheelEvent = event
    focused.scroll()
})

window.addEventListener('keydown', (event) => {
    if (event.key == "Control") {
        heldKeys["Control"] = true
    }
    else if ((event.key == "ArrowLeft" || event.key == "ArrowUp" || event.key == "a" || event.key == "w") && !focused.classList.contains("hidden")) {
        event.preventDefault()
        focusedCardsContainer.scrollToIndex(focused.focusedCard.index - 1)
    }
    else if ((event.key == "ArrowRight" || event.key == "ArrowDown" || event.key == "d" || event.key == "s") && !focused.classList.contains("hidden")) {
        event.preventDefault()
        focusedCardsContainer.scrollToIndex(focused.focusedCard.index + 1)
    }
    else if (event.key == "i" && heldKeys["Control"] == true) {
        const hoveredCard = document.getElementsByClassName("hovered-card")[0]
        if (hoveredCard) { 
            const rect = hoveredCard.getBoundingClientRect()
            console.log(`x: ${rect.x}, y: ${rect.y}, width: ${rect.width}, height: ${rect.height}`)
            console.log(`dataUrl: ${hoveredCard.dataUrl}`)
            console.log(hoveredCard.data)
        }
    }
    else if (event.key == "h" && heldKeys["Control"] == true) {
        toggleCardHolo()
    }
    else if (event.key == "m" && heldKeys["Control"] == true) {
        cardsFaceMouse = !cardsFaceMouse
        console.log(`Cards Face Mouse = ${cardsFaceMouse}`)
    }
})

window.addEventListener('keyup', (event) => {
    if (event.key == "Control") {
        heldKeys["Control"] = false
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