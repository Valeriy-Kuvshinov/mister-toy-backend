const fs = require('fs')
const toys = require('../data/toy.json')

module.exports = {
    query,
    getById,
    save,
    remove
}

function query(filterBy, sort) {
    if (!filterBy) return Promise.resolve(toys)

    let filteredToys = toys
    if (filterBy.name) {
        const regExp = new RegExp(filterBy.name, 'i')
        filteredToys = filteredToys.filter(toy => regExp.test(toy.name))
    }
    if (filterBy.labels && filterBy.labels[0]) {
        filteredToys = filteredToys.filter(toy => toy.labels.some(label => filterBy.labels.includes(label)))
    }
    if (filterBy.inStock) {
        filteredToys = filteredToys.filter(toy => toy.inStock === JSON.parse(filterBy.inStock))
    }
    filterBy.minPrice = (+filterBy.minPrice) ? +filterBy.minPrice : -Infinity
    filterBy.maxPrice = (+filterBy.maxPrice || filterBy.maxPrice === 0) ? +filterBy.maxPrice : Infinity
    filteredToys = filteredToys.filter(toy => (toy.price >= filterBy.minPrice && toy.price <= filterBy.maxPrice))

    filteredToys.sort((toy1, toy2) => {
        const dir = JSON.parse(sort.asc) ? 1 : -1
        if (sort.by === 'price') return (toy1.price - toy2.price) * dir
        if (sort.by === 'name') return toy1.name.localeCompare(toy2.name) * dir
        if (sort.by === 'createdAt') return (toy1.createdAt - toy2.createdAt) * dir
    })
    return Promise.resolve(filteredToys)
}

function getById(_id) {
    const toy = toys.find(toy => toy._id === _id)
    return Promise.resolve(toy);
}

function remove(_id) {
    const idx = toys.findIndex(toy => toy._id === _id)
    toys.splice(idx, 1)
    _saveToysToFile()
    return Promise.resolve()
}

function save(toy) {
    if (toy._id) {
        const idx = toys.findIndex(currToy => currToy._id === toy._id)
        toys[idx] = { ...toys[idx], ...toy }
    } else {
        toy.createdAt = Date.now()
        toy._id = _makeId()
        toys.unshift(toy)
    }
    _saveToysToFile()
    return Promise.resolve(toy)
}

function _makeId(length = 5) {
    var txt = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    for (var i = 0; i < length; i++) {
        txt += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return txt;
}

function _saveToysToFile() {
    fs.writeFileSync('data/toy.json', JSON.stringify(toys, null, 2))
}