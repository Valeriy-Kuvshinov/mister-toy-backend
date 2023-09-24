const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const toyService = require('./services/toy.service.js')

const app = express()

// Express App Config
app.use(express.json())
app.use(cookieParser())
app.use(express.static('public'))

if (process.env.NODE_ENV === 'production') {
    app.use(express.static('public'))
} else {
    const corsOptions = {
        origin: [
            'http://127.0.0.1:3000',
            'http://localhost:3000',
            'http://localhost:5173',
            'http://127.0.0.1:5173',
            'http://127.0.0.1:8080',
            'http://localhost:8080',
        ],
        credentials: true
    }
    app.use(cors(corsOptions))
}

app.get('/api/toy', (req, res) => {
    const { filterBy = {}, sort = {} } = req.query.params
    console.log("req.query.params:", req.query.params)

    toyService.query(filterBy, sort)
        .then(toys => {
            res.send(toys)
        })
        .catch(err => {
            console.log('Had issues getting toys', err)
            res.status(400).send({ msg: 'Had issues getting toys' })
        })
})

app.get('/api/toy/:id', (req, res) => {
    const toyId = req.params.id
    toyService.getById(toyId)
        .then(toy => {
            res.send(toy)
        })
        .catch(err => {
            console.log('Had issues getting toy', err)
            res.status(400).send({ msg: 'Had issues getting toy' })
        })
})

app.delete('/api/toy/:id', (req, res) => {
    const toyId = req.params.id
    toyService.remove(toyId)
        .then(() => {
            res.end('Done!')
        })
        .catch(err => {
            console.log('Had issues deleting toy', err)
            res.status(400).send({ msg: 'Had issues deleteing toy' })
        })
})

app.post('/api/toy', (req, res) => {
    const toy = req.body
    toyService.save(toy)
        .then(savedToy => {
            res.send(savedToy)
        })
        .catch(err => {
            console.log('Had issues adding toy', err)
            res.status(400).send({ msg: 'Had issues adding toy' })
        })
})

app.put('/api/toy/:id', (req, res) => {
    const toy = req.body
    toyService.save(toy)
        .then(savedToy => {
            res.send(savedToy)
        })
        .catch(err => {
            console.log('Had issues updating toy', err)
            res.status(400).send({ msg: 'Had issues updating toy' })
        })
})

const port = process.env.PORT || 3030
app.listen(port, () => {
    console.log('Server is up and listening to', port)
})