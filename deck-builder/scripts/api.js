const API = {
    urlsBeingFetched: [],

    fetchCards: async function (url) {
        try {
            console.log(`Fetching ${url}`)
    
            API.urlsBeingFetched.push(url)
    
            const response = await fetch(url, { headers: { 'X-Api-Key': API.apiKey } })
            // const response = await fetch(url)
    
            console.log(`Recieved ${url}`)
    
            const json = await response.json()
            if (json["error"]) {
                console.error(`Error ${json["error"]["code"]}. ${json["error"]["message"]}`)
                return 400
            }
    
            API.urlsBeingFetched.splice(API.urlsBeingFetched.indexOf(url), 1)
    
            return {
                'url': url,
                'cards': json['data'],
                'page': json['page'],
                'pageSize': json['pageSize'],
                'totalCardCount': json['totalCount']
            }
        }
        catch {
            console.error(`Error fetching ${url}.`)
            return 404
        }
    }
}

// function sortCards (cards) {
//     types = {
//         "Grass": [],
//         "Fire": [],
//         "Water": [],
//         "Lightning": [],
//         "Psychic": [],
//         "Fighting": [],
//         "Darkness": [],
//         "Metal": [],
//         "Fairy": [],
//         "Dragon": [],
//         "Colorless": [],
//         "other": []
//     }
//     for (let i = 0; i < cards.length; i++) {
//         const card = cards[i]
//         // if (card.types && ((parseInt(card.number) <= card.set.printedTotal && types["other"].length == 0) || card.rarity.includes("Rare Holo"))) { //if card number is <= total && no trainers have been sorted
//         if (card.types) {
//             types[card.types[0]].push(card)
//         }
//         else {
//             types["other"].push(card)
//         }
//     }
//     for (type in types) {
//         if (type != "other") {
//             types[type].sort((a, b) => (a.nationalPokedexNumbers[0] > b.nationalPokedexNumbers[0]) ? 1 : (a.nationalPokedexNumbers[0] === b.nationalPokedexNumbers[0]) ? ((parseInt(a.number) > parseInt(b.number)) ? 1 : -1) : -1 )
//         }
//     }
//     return [].concat(types["Grass"]).concat(types["Fire"]).concat(types["Water"]).concat(types["Lightning"]).concat(types["Psychic"]).concat(types["Fighting"]).concat(types["Darkness"]).concat(types["Metal"]).concat(types["Fairy"]).concat(types["Dragon"]).concat(types["Colorless"]).concat(types["other"])
// }