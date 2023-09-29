const Cryptr = require('cryptr')
const dotenv = require('dotenv')
const fs = require('fs')
const users = require('../data/user.json')
const { utilService } = require('./util.service.js')

dotenv.config()
const cryptr = new Cryptr(process.env.DECRYPTION || 'Secret-1234')

module.exports = {
    query,
    getById,
    remove,
    save,
    checkLogin,
    getLoginToken,
    validateToken
}

function getLoginToken(user) {
    const str = JSON.stringify(user)
    const encryptedStr = cryptr.encrypt(str)
    return encryptedStr
}

function validateToken(token) {
    const str = cryptr.decrypt(token)
    const user = JSON.parse(str)
    return user
}

function checkLogin({ username, password }) {
    let user = users.find(user => user.username === username && user.password === password)
    if (user) {
        user = {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            password: user.password,
            isAdmin: user.isAdmin,
        }
        return Promise.resolve(user)
    }
    else return Promise.reject('Invalid login')
}

function query() {
    return Promise.resolve(users)
}

function getById(userId) {
    const user = users.find(user => user._id === userId)
    if (!user) return Promise.reject('User not found!')
    return Promise.resolve(user)
}

function remove(userId) {
    const index = users.findIndex(user => user._id === userId)
    if (index > -1) users.splice(index, 1)
    return _saveUsersToFile()
}

function save(user) {
    let userToUpdate = user
    if (user._id) {
        const idx = users.findIndex(_user => user._id === _user._id)
        if (idx > -1) users[idx] = { ...users[idx], ...userToUpdate }
    } else {
        userToUpdate._id = utilService.makeId()
        userToUpdate.isAdmin = false
        userToUpdate.createdAt = Date.now()
        users.push(userToUpdate)
    }
    return _saveUsersToFile().then(() => userToUpdate)
}

function _saveUsersToFile() {
    return new Promise((resolve, reject) => {
        const usersStr = JSON.stringify(users, null, 4)
        fs.writeFile('data/user.json', usersStr, (err) => {
            if (err) {
                return console.log(err)
            }
            resolve()
        })
    })
}