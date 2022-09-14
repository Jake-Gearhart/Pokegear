function getEVs () {
    return {
        "hp": parseInt(document.getElementById("hp").value),
        "attack": parseInt(document.getElementById("attack").value),
        "defence": parseInt(document.getElementById("defence").value),
        "special_attack": parseInt(document.getElementById("special_attack").value),
        "special_defence": parseInt(document.getElementById("special_defence").value),
        "speed": parseInt(document.getElementById("speed").value)
    }
}

function isValid (evs) {
    if (evs["hp"] + evs["attack"] + evs["special_attack"] + evs["special_defence"] + evs["defence"] + evs["speed"] > 510) { return `INVALID EVs. Total ${evs["hp"] + evs["attack"] + evs["special_attack"] + evs["special_defence"] + evs["defence"] + evs["speed"]} > 510` }
    else if (evs["hp"] > 255) { return `INVALID HP EVs. ${evs["hp"]} > 255` }
    else if (evs["attack"] > 255) { return `INVALID Attack EVs. ${evs["attack"]} > 255` }
    else if (evs["special_attack"] > 255) { return `INVALID Special Attack EVs. ${evs["special_attack"]} > 255` }
    else if (evs["defence"] > 255) { return `INVALID Defence EVs. ${evs["defence"]} > 255` }
    else if (evs["special_defence"] > 255) { return `INVALID Special Defence EVs. ${evs["special_defence"]} > 255` }
    else if (evs["speed"] > 255) { return `INVALID Speed EVs. ${evs["speed"]} > 255` }
}

function convertStats () {
    const evs = getEVs()

    const invalidMessage = isValid(evs)
    if (invalidMessage) {
        alert(invalidMessage)
        return
    }

    let new_evs = {
        "hp": evs["hp"],
        "attack": evs["attack"],
        "defence": evs["defence"],
        "special": evs["special_attack"] + evs["special_defence"],
        "speed": evs["speed"]
    }

    let excess_points = 0
    let non_full_stats = []
    for (const ev in new_evs) {
        if (new_evs[ev] > 102) {
            excess_points += new_evs[ev] - 102
            new_evs[ev] = 102
        }
        else if (new_evs[ev] < 102) {
            non_full_stats.push(ev)
        }
    }

    while (excess_points > 0) {
        const rand = Math.floor(Math.random() * non_full_stats.length)
        const randStat = non_full_stats[rand]
        new_evs[randStat]++
        excess_points--

        if (new_evs[randStat] == 102) {
            non_full_stats.splice(rand, 1)
        }
    }

    for (const ev in new_evs) {
        new_evs[ev] = Math.floor(new_evs[ev] * 65535/102)
    }

    alert(`HP: ${new_evs["hp"]}\nAttack: ${new_evs["attack"]}\nDefence: ${new_evs["defence"]}\nSpecial: ${new_evs["special"]}\nSpeed: ${new_evs["speed"]}`)
}