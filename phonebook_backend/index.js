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
    else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
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

app.post('/api/persons', (req, res, next) => {
    const body = req.body
    if (!body.name || !body.number) {
        return res.status(400).json({
            error: 'name or number is missing'
        })
    }
    /* Frontend checks uniquity but a direct POST-request can add
       duplicates */
    Person.findOne({ name: `${body.name}` }).exec()
        .then(result => {
            if (result) {
                console.log("This person is already in the phonebook")
                return res.status(400).json({
                    error: 'this name is already in the phonebook'
                })
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
                    .catch(err => next(err))
            }
        })
})

app.put('/api/persons/:id', (req, res, next) => {
    const { name, number } = req.body
    Person.findByIdAndUpdate(req.params.id, { name, number }, { runValidators: true, context: 'query' })
        .then(updatedPerson => {
            console.log(`updated ${name}'s number to ${number}`)
            res.json(updatedPerson)
        })
        .catch(err => next(err))
})

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})