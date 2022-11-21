class Card extends HTMLElement {
    constructor() {
        super()

        this.holo = false
    }

    connectedCallback() {
        this.draggable = true

        this.display = document.createElement("div")
        this.display.classList.add("card-display")
        this.appendChild(this.display)

        this.image = document.createElement("div")
        this.image.classList.add("card-image")
        this.display.appendChild(this.image)

        this.glare = document.createElement("div")
        this.glare.classList.add("card-glare")
        this.image.appendChild(this.glare)
        
        this.setAttribute("onmouseleave", "this.unhover()")
        this.setAttribute("onclick", "this.onClick()")
        this.setAttribute("ondragstart", "this.dragStart(event)")
    }

    setData (inputData) {
        this.data = inputData

        if (!inputData) { return }

        this.image.style["backgroundImage"] = `url(${inputData.images.small}),url("deck-builder/images/placeholder.png")`

        if (inputData.rarity && inputData.rarity != "Common" && inputData.rarity != "Uncommon" && inputData.rarity != "Rare" &&
           (inputData.rarity != "Promo" || (inputData.tcgplayer && inputData.tcgplayer.prices && inputData.tcgplayer.prices.holofoil))) {
            this.holo = true
            this.image.classList.add("holofoil")
        }

        if (this.classList.contains('hovered-card')) {
            this.showHDImage()
        }
    }

    dragStart (event) {
        console.log('Drag Start')
        this.unhover()

        const dragImage = document.createElement('div')
        if (this.data && this.data.images && this.data.images.small) {
            dragImage.style["backgroundImage"] = `url(${this.data.images.small})`
        }
        else {
            dragImage.style["backgroundImage"] = 'url("images/placeholder.png")'
        }
        dragImage.classList.add('drag-image')
        this.appendChild(dragImage)
        const rect = dragImage.getBoundingClientRect()
        event.dataTransfer.setDragImage(dragImage, rect.width/2, rect.height/2);
        setTimeout(() => {
            dragImage.remove()
        }, 0);
    }

    addTooltip (text) {
        // if (!this.tooltip) {
        //     this.tooltip = document.createElementNS("http://www.w3.org/2000/svg", "svg")
        //     this.tooltip.classList.add("card-tooltip")
        //     this.display.appendChild(this.tooltip)
        //     this.tooltipText = document.createElementNS('http://www.w3.org/2000/svg', 'text')
        //     this.tooltipText.classList.add("card-tooltip-text")
        //     this.tooltipText.setAttribute("x", "50%")
        //     this.tooltipText.setAttribute("y", "50%")
        //     this.tooltip.appendChild(this.tooltipText)
        // }

        // this.tooltipText.innerHTML = text

        if (!this.tooltip) {
            this.tooltip = document.createElement("div")
            this.tooltip.classList.add("card-tooltip")
            this.display.appendChild(this.tooltip)
        }

        this.tooltip.innerHTML = text
    }

    onClick () {
        // this.unhover()
    }

    showHDImage () {
        if (this.data && this.data.images && this.data.images.large) {
            if (!this.image_hd) {
                this.image_hd = document.createElement('img')
                this.image_hd.classList.add('hd-card-image')
                this.image_hd.addEventListener('load', () => {
                    if (this.classList.contains("hovered-card")) {
                        this.image_hd.style["opacity"] = 1
                    }
                })
                this.image_hd.src = this.data.images.large
                this.image.prepend(this.image_hd)
            }
            else {
                this.image_hd.style["opacity"] = 1
            }
        }

        this.image.classList.add("holofoil-high-res")
    }

    hideHDImage () {
        if (this.image_hd) { 
            this.image_hd.style["opacity"] = 0
        }
        
        this.image.classList.remove("holofoil-high-res")
    }

    hover (event) {
        if (!this.classList.contains("hovered-card")) {
            for (let i = 0, hoveredCards = document.getElementsByClassName("hovered-card"), n = hoveredCards.length; i < n; i++) { 
                hoveredCards[i].unhover() 
            }

            this.classList.add("hovered-card")
            
            this.showHDImage()

            //position card
            let offscreenX = 0
            if (this.offsetLeft - this.offsetWidth * 0.5 < 0) {
                offscreenX = 100 * Math.min(0, this.offsetLeft - this.offsetWidth * 0.5) / this.offsetWidth - 100 * 17/434
            }
            else {
                offscreenX = 100 * Math.max(0, this.offsetLeft + this.offsetWidth * 1.5 - this.offsetParent.offsetWidth) / this.offsetWidth
            }

            let ato = 0
            if (this.offsetParent.additionalTopOffset) { ato = this.offsetParent.additionalTopOffset }

            let offscreenY = 0
            if (this.offsetTop - this.offsetHeight * 0.5 - this.offsetParent.scrollTop - ato < 0) {
                offscreenY = 100 * Math.min(0, this.offsetTop - this.offsetHeight * 0.5 - this.offsetParent.scrollTop - ato) / this.offsetHeight - 50 * 17/606
            }
            else {
                offscreenY = 100 * Math.max(0, this.offsetTop + this.offsetHeight * 1.5 - this.offsetParent.scrollTop - this.offsetParent.offsetHeight) / this.offsetHeight
            }

            this.display.style["left"] = `${-50 - offscreenX}%`
            this.display.style["top"] = `${-50 - offscreenY}%`
            this.display.style["width"] = `calc(100% + ${100 * 417/434}%)`
            this.display.style["height"] = `calc(100% + ${100 * 589/606}%`
        }

        const rect = this.image.getBoundingClientRect()

        const widthRatio = (event.clientX - (rect.left + rect.width/2)) /(rect.width/2)
        const heightRatio = (event.clientY - (rect.top + rect.height/2)) /(rect.height/2)

        if (cardsFaceMouse == true) {
            this.image.style["transform"] = `perspective(700px) rotate(${-1 * widthRatio * heightRatio}deg) rotateX(${heightRatio * -15}deg) rotateY(${widthRatio * 15}deg)`
            if (this.holo == false) {
                this.glare.style["background"] = `radial-gradient(farthest-corner circle at ${50 - widthRatio * 200/3}% ${50 - heightRatio * 200/3}%,rgba(255,255,255,0.25) 0%,rgba(0,0,0,0.25) 100%)`
            }
            else {
                this.glare.style["background"] = `radial-gradient(farthest-corner circle at ${50 - widthRatio * 200/3}% ${50 - heightRatio * 200/3}%,rgba(255,255,255,0.5) 0%,rgba(0,0,0,0.5) 100%)`
            }
        }
    }

    unhover () {
        //hide HD image
        this.hideHDImage()

        this.image.style["transform"] = null
        this.classList.remove("hovered-card")
        this.glare.style["background"] = null

        this.display.style["width"] = null
        this.display.style["height"] = null
        this.display.style["top"] = null
        this.display.style["left"] = null
    }
}
customElements.define("pokemon-card", Card)