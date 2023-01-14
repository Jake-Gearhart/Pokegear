class Card extends HTMLElement {
    constructor() {
        super()
    }

    connectedCallback() {
        this.display = document.createElement("div")
        this.display.classList.add("card-display")
        this.appendChild(this.display)

        this.image = document.createElement("div")
        this.image.classList.add("card-image")
        this.display.appendChild(this.image)

        this.glare = document.createElement("div")
        this.glare.classList.add("card-glare")
        this.image.appendChild(this.glare)

        if (!focusedCardsContainer.contains(this)) {
            this.draggable = true
            this.setAttribute("onmouseleave", "this.unhover()")
            this.setAttribute("onclick", "this.onClick()")
            this.setAttribute("ondragstart", "this.dragStart(event)")
            this.setAttribute("ondragend", "this.dragEnd(event)")
        }

        this.holo = false
        this.rotateHorizontal = false
    }

    setData (inputData) {
        if (!inputData) { return }

        this.data = inputData

        this.image.style["backgroundImage"] = `url(${inputData.images.small}),url("deck-builder/images/placeholder.png")`

        if ((inputData.rarity && inputData.rarity != "Common" && inputData.rarity != "Uncommon" && inputData.rarity != "Rare" && inputData.rarity != "Promo") || 
            (inputData.tcgplayer && inputData.tcgplayer.prices && inputData.tcgplayer.prices.holofoil)) {
            this.holo = true
            this.image.classList.add("holofoil")
        }

        if (this.data.name.includes(" BREAK") || this.data.name.includes(" LEGEND")) { this.rotateHorizontal = true }

        if (this.classList.contains('hovered-card') || focusedCardsContainer.contains(this)) {
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

    dragEnd (event) {
        console.log('Drag End')
    }

    onClick () {
        this.unhover()
        focused.show(this)
    }

    showHDImage () {
        if (this.data && this.data.images && this.data.images.large) {
            if (!this.image_hd) {
                this.image_hd = document.createElement('img')
                this.image_hd.classList.add('hd-card-image')
                this.image_hd.addEventListener('load', () => {
                    if (this.classList.contains("hovered-card") || focusedCardsContainer.contains(this)) {
                        this.image_hd.style["opacity"] = 1
                    }
                })
                // this.image_hd.src = this.data.images.large + '?set=' + this.data.images.large.split('/').slice(-2,-1)[0]
                this.image_hd.crossOrigin = 'Anonymous'
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

    hover () {
        if (!this.classList.contains("hovered-card")) {
            this.classList.add("hovered-card")
            
            if (this.rotateHorizontal == true) {
                this.display.style["transform"] = "rotateZ(90deg)"
            }

            if (!focusedCardsContainer.contains(this)) {
                this.showHDImage()

                //position card to fit on screen
                const parentStyle = window.getComputedStyle(this.offsetParent)
    
                let minLeft = parseFloat(parentStyle.paddingLeft)
                let maxLeft = this.offsetParent.offsetWidth - minLeft
                let newLeftPercent = 0.5
    
                let minTop = this.offsetParent.scrollTop + parseFloat(parentStyle.paddingTop) - (this.offsetParent.additionalTopOffset ? this.offsetParent.additionalTopOffset : 0)
                let maxTop = this.offsetParent.scrollTop + this.offsetParent.offsetHeight - parseFloat(parentStyle.paddingBottom)
                let newTopPercent = 0.5
                
                if (this.rotateHorizontal == false) {
                    minLeft += this.offsetWidth / 2 //w / 2
                    maxLeft -= this.offsetWidth * 3/2 //w * 3/2
    
                    minTop += this.offsetHeight / 2 //h / 2
                    maxTop -= this.offsetHeight * 3/2 //h * 3/2
                }
                else {
                    minLeft += (2 * this.offsetHeight - this.offsetWidth) / 2 //(2h - w) / 2
                    maxLeft -= (2 * this.offsetHeight + this.offsetWidth) / 2 //(2h - w) / 2 + w --> (2h + w) / 2
    
                    minTop += (2 * this.offsetWidth - this.offsetHeight) / 2 //(2w - h) / 2
                    maxTop -= (2 * this.offsetWidth + this.offsetHeight) / 2 //(2w - h) / 2 + h --> (2w + h) / 2
                }
    
                //horizontal
                if (this.offsetLeft < minLeft) {
                    newLeftPercent -= (minLeft - this.offsetLeft) / this.offsetWidth
                }
                else if (this.offsetLeft > maxLeft) {
                    newLeftPercent -= (maxLeft - this.offsetLeft) / this.offsetWidth
                }
    
                //vertical
                if (this.offsetTop < minTop) {
                    newTopPercent -= (minTop - this.offsetTop) / this.offsetHeight
                }
                else if (this.offsetTop > maxTop) {
                    newTopPercent -= (maxTop - this.offsetTop) / this.offsetHeight
                }
    
                this.display.style["width"] = `calc(100% + ${100 * 417/434}%)`
                this.display.style["height"] = `calc(100% + ${100 * 589/606}%`
                this.display.style["left"] = `calc(-100% * ${newLeftPercent} + 50% * 17/434)`
                this.display.style["top"] = `calc(-100% * ${newTopPercent} + 50% * 17/606)`
            }
        }

        if (cardsFaceMouse == true && mostRecentClickEvent.type != 'touch') {
            const imageRect = this.image.getBoundingClientRect()

            const mouseRelativeX = (Math.min(Math.max(mousePos.x, imageRect.left), imageRect.left + imageRect.width) - (imageRect.left + imageRect.width/2)) / (imageRect.width/2)
            const mouseRelativeY = (Math.min(Math.max(mousePos.y, imageRect.top), imageRect.top + imageRect.height) - (imageRect.top + imageRect.height/2)) / (imageRect.height/2)
            // console.log(`MouseX: ${mousePos.x}, MouseY: ${mousePos.y}, imageRect.reft: ${imageRect.left}, imageRect.top: ${imageRect.top}, imageRect.width: ${imageRect.width}, imageRect.height: ${imageRect.height}`)
    
            let perspective = 700
            if (focusedCardsContainer.contains(this)) { perspective *= 2 }

            this.glare.style["opacity"] = 1

            if (this.rotateHorizontal == false) {
                this.image.style["transform"] = `perspective(${perspective}px) rotate(${-1 * mouseRelativeX * mouseRelativeY}deg) rotateX(${mouseRelativeY * -15}deg) rotateY(${mouseRelativeX * 15}deg)`
                this.glare.style["background"] = `radial-gradient(farthest-corner circle at ${50 - mouseRelativeX * 200/3}% ${50 - mouseRelativeY * 200/3}%,rgba(255, 255, 255, ${this.holo ? 0.5 : 0.25}) 0%, rgba(0, 0, 0, ${this.holo ? 0.5 : 0.25}) 100%)`
            }
            else {
                this.image.style["transform"] = `perspective(${perspective}px) rotate(${1 * mouseRelativeX * mouseRelativeY}deg) rotateX(${mouseRelativeX * 15}deg) rotateY(${mouseRelativeY * 15}deg)`
                this.glare.style["background"] = `radial-gradient(farthest-corner circle at ${50 - mouseRelativeY * 200/3}% ${50 - mouseRelativeX * -200/3}%,rgba(255, 255, 255, ${this.holo ? 0.5 : 0.25}) 0%, rgba(0, 0, 0, ${this.holo ? 0.5 : 0.25}) 100%)`
            }
        }
    }

    unhover () {
        if (!focusedCardsContainer.contains(this)) { this.hideHDImage() }

        this.display.style["transform"] = null
        this.image.style["transform"] = null
        this.classList.remove("hovered-card")
        this.glare.style["opacity"] = null

        this.display.style["width"] = null
        this.display.style["height"] = null
        this.display.style["top"] = null
        this.display.style["left"] = null
    }
}
customElements.define("pokemon-card", Card)