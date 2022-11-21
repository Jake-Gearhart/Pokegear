async function fetchCards (url) {
    try {
        console.log(`Fetching ${url}`)

        const response = await fetch(url)
        const json = await response.json()

        console.log(`Recieved ${url}`)

        return {
            'cards': json['data'],
            'page': json['page'],
            'pageSize': json['pageSize'],
            'totalCardCount': json['totalCount']
        }
    }
    catch {
        console.log(`Error fetching ${url}`)
    }
}

async function fetchJapaneseCard (url) {
    try {
        console.log(`Fetching ${url}`)

        const response = await fetch(`https://cors-anywhere.herokuapp.com/${url}`)
        console.log(response.text())
    }
    catch {
        console.log(`Error fetching ${url}`)
    }
}

function sortCards (cards) {
    types = {
        "Grass": [],
        "Fire": [],
        "Water": [],
        "Lightning": [],
        "Psychic": [],
        "Fighting": [],
        "Darkness": [],
        "Metal": [],
        "Fairy": [],
        "Dragon": [],
        "Colorless": [],
        "other": []
    }
    for (let i = 0; i < cards.length; i++) {
        const card = cards[i]
        // if (card.types && ((parseInt(card.number) <= card.set.printedTotal && types["other"].length == 0) || card.rarity.includes("Rare Holo"))) { //if card number is <= total && no trainers have been sorted
        if (card.types) {
            types[card.types[0]].push(card)
        }
        else {
            types["other"].push(card)
        }
    }
    for (type in types) {
        if (type != "other") {
            types[type].sort((a, b) => (a.nationalPokedexNumbers[0] > b.nationalPokedexNumbers[0]) ? 1 : (a.nationalPokedexNumbers[0] === b.nationalPokedexNumbers[0]) ? ((parseInt(a.number) > parseInt(b.number)) ? 1 : -1) : -1 )
        }
    }
    return [].concat(types["Grass"]).concat(types["Fire"]).concat(types["Water"]).concat(types["Lightning"]).concat(types["Psychic"]).concat(types["Fighting"]).concat(types["Darkness"]).concat(types["Metal"]).concat(types["Fairy"]).concat(types["Dragon"]).concat(types["Colorless"]).concat(types["other"])
}