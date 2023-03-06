function resizeWindow () {
    ELEMENTS.sidebar.setTab()

    const filterCardRect = ELEMENTS.filterCard.getBoundingClientRect()
    document.root.style.setProperty('--filter-card-width-percent', `${filterCardRect.width/100}px`)
    document.root.style.setProperty('--filter-card-height-percent', `${filterCardRect.height/100}px`)
}
window.addEventListener('resize', resizeWindow)
resizeWindow()

window.addEventListener('touchstart', (event) => {
    GLOBAL.latestClickEvent.type = 'touch'
    GLOBAL.latestClickEvent.wait = true
})

window.addEventListener('mousemove', (event) => {
    if (GLOBAL.mousePos.x == event.clientX && GLOBAL.mousePos.y == event.clientY) { return }

    GLOBAL.mousePos.x = event.clientX
    GLOBAL.mousePos.y = event.clientY
    GLOBAL.mouseTarget = event.target

    if (GLOBAL.latestClickEvent.type == 'touch') {
        if (GLOBAL.latestClickEvent.wait == true) { GLOBAL.latestClickEvent.wait = false }
        else { GLOBAL.latestClickEvent.type = 'click' }
    }

    if (GLOBAL.latestClickEvent.type != 'touch') {
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
    GLOBAL.latestWheelEvent = event
    focused.scroll()
})

window.addEventListener('keydown', (event) => {
    if (event.key == "Control") {
        GLOBAL.heldKeys["Control"] = true
    }
    else if ((event.key == "ArrowLeft" || event.key == "ArrowUp" || event.key == "a" || event.key == "w") && !focused.classList.contains("hidden")) {
        event.preventDefault()
        ELEMENTS.focusedCardsContainer.scrollToIndex(focused.focusedCard.index - 1)
    }
    else if ((event.key == "ArrowRight" || event.key == "ArrowDown" || event.key == "d" || event.key == "s") && !focused.classList.contains("hidden")) {
        event.preventDefault()
        ELEMENTS.focusedCardsContainer.scrollToIndex(focused.focusedCard.index + 1)
    }
    else if (event.key == "i" && GLOBAL.heldKeys["Control"] == true) {
        const hoveredCard = document.getElementsByClassName("hovered-card")[0]
        if (hoveredCard) { 
            const rect = hoveredCard.getBoundingClientRect()
            console.log(`x: ${rect.x}, y: ${rect.y}, width: ${rect.width}, height: ${rect.height}`)
            console.log('dataSource', hoveredCard.dataSource)
            console.log(hoveredCard.data)
        }
    }
    else if (event.key == "h" && GLOBAL.heldKeys["Control"] == true) {
        toggleCardHolo()
    }
    else if (event.key == "m" && GLOBAL.heldKeys["Control"] == true) {
        GLOBAL.cardsFaceMouse = !GLOBAL.cardsFaceMouse
        console.log(`Cards Face Mouse = ${GLOBAL.cardsFaceMouse}`)
    }
})

window.addEventListener('keyup', (event) => {
    if (event.key == "Control") {
        GLOBAL.heldKeys["Control"] = false
    }
})

function toggleCardHolo () {
    const currentValue = getComputedStyle(document.root).getPropertyValue("--card-holo-display")
    if (currentValue == 'inline-block') {
        document.root.style.setProperty("--card-holo-display-low-res", "none");
        document.root.style.setProperty("--card-holo-display-high-res", "none");
        console.log("Card Holo Effect Off")
    }
    else {
        document.root.style.setProperty("--card-holo-display-low-res", "inline-block");
        document.root.style.setProperty("--card-holo-display-high-res", "inline-block");
        console.log("Card Holo Effect On")
    }
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

function downloadTempButton (filename, data) {
    var temp = document.createElement('a');
    temp.download = filename;
    temp.href = data;
    document.body.appendChild(temp);
    temp.click();
    temp.remove();
}