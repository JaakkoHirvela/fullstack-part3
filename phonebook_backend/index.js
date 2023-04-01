require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./models/person')

morgan.token('data', (req) => {
    if (req.method === 'POST') {
        return JSON.stringify(req.body)
    }
    return " "
})

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    }

    next(error)
}

app.use(cors())
app.use(express.json())
app.use(express.static('build'))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))

app.get('/', (req, res) => {
    res.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (req, res) => {
    Person.find({}).then(people => {
        res.json(people)
    })
})


app.get('/info', (req, res) => {
    const date = new Date()
    Person.find({}).then(people => {
        res.send(`<div>Phonebook has info for ${people.length} people</div>
                  <div>${date}</div>`)
    })
})

app.get('/api/persons/:id', (req, res, next) => {
    const id = req.params.id
    Person.findById(id)
        .then(person => {
            if (person) {
                res.json(person).status(200)
            }
            else {
                res.status(404).end()
            }
        })
        .catch(err => {
            next(err)
        })
})

app.delete('/api/persons/:id', (req, res) => {
    Person.findByIdAndDelete(req.params.id)
        .then(result => {
            res.status(204).end()
        })
        .catch(err => {
            next(err)
        })
})

app.post('/api/persons', (req, res) => {
    const body = req.body
    if (!body.name || !body.number) {
        return res.status(400).json({
            error: 'name or number is missing'
        })
    }
    Person.findOne({ name: `${body.name}` }).exec()
        .then(result => {
            if (result) {
                console.log("This person is already in the phonebook")
            }
            else {
                const person = new Person({
                    name: `${body.name}`,
                    number: `${body.number}`,
                })

                person.save().then(result => {
                    console.log(`added ${body.name} number ${body.number} to phonebook`)
                    res.json(person)
                })
            }
        })
})

app.put('/api/persons/:id', (req, res, next) => {
    const body = req.body
    if (!body.number) {
        console.log("number is missing")
        return res.status(400).json({
            error: 'number is missing'
        })
    }
    Person.updateOne({ name: `${body.name}` }, { number: `${body.number}` }).exec()
        .then(result => {
            console.log(`updated ${body.name}'s number to ${body.number}`)
        })
})

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
    generateId()
})