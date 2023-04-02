import { useState, useEffect } from 'react'
import personService from './services/persons'

const Contact = (props) => {
  if (props.filter === '' || props.name.toLowerCase().includes(props.filter.toLowerCase())) {
    return (
      <p>
        {props.name} {props.number} <button onClick={props.onClick}>delete</button>
      </p>
    )
  }
}

const FilterForm = (props) => {
  return (
    <div>
      filter shown with: <input value={props.value} onChange={props.onChange} />
    </div>
  )
}

const ContactAddingForm = (props) => {
  return (
    <form onSubmit={props.onSubmit}>
      <div>
        name: <input value={props.name} onChange={props.onNameChange} />
      </div>
      <div>
        number: <input value={props.number} onChange={props.onNumberChange} />
      </div>
      <div>
        <button type="submit">add</button>
      </div>
    </form>
  )
}

const Contacts = ({ filter, onClick, persons }) => {
  return (
    persons.map(person =>
      <Contact key={person.name} name={person.name}
        number={person.number} filter={filter} onClick={() => onClick(person.name, person.id)} />)
  )
}

const Notification = ({ message, isError }) => {
  if (message === null) {
    return null
  }
  return (
    <div className={isError ? "error" : "notification"} >
      {message}
    </div>
  )
}

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [newFilter, setNewFilter] = useState('')
  const [notificationMessage, setNotificationMessage] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const getAll = () => {
    personService.getPersons()
      .then(initialPersons => {
        console.log('initialpersons', initialPersons);
        setPersons(initialPersons)
      })
  }
  useEffect(getAll, [])
  console.log('render', persons.length, 'persons')

  const makeNotification = (message, isError) => {
    if (isError){
      setErrorMessage(message)
    }
    else{
      setNotificationMessage(message)
    }
    setTimeout(() => {
      setNotificationMessage(null)
      setErrorMessage(null)
    }, 5000)
  }

  const addName = (event) => {
    event.preventDefault()

    const newPerson = { name: newName, number: newNumber }

    const foundPerson = persons.find(person => person.name === newName)

    if (foundPerson !== undefined) {
      if (window.confirm(`${newName} is already added to phonebook, replace the old number with a new one?`)) {
        personService.putPerson(newPerson, foundPerson.id)
          .then(modifiedPerson => {
            console.log("response", modifiedPerson);
            makeNotification(`Updated ${modifiedPerson.name}'s number`, false)
            getAll()
          }
          )
          .catch(error => {
            console.log(error)
            makeNotification(`${error.response.data.error}`, true)
          })
      }
    }
    else {
      personService.addPerson(newPerson)
        .then(newPerson => {
          console.log('add newPerson', newPerson);
          setPersons(persons.concat(newPerson))
          makeNotification(`Added ${newPerson.name}`, false)
        })
        .catch(err => {
          console.log(err.response.data)
          makeNotification(`${err.response.data.error}`, true)
        })
    }
  }

  const deleteName = (personName, personId) => {
    console.log("delete clicked", personId);
    if (window.confirm(`Delete ${personName}?`)) {
      personService.deletePerson(personId).then(status => {
        console.log("response status: ", status);
        makeNotification(`Deleted ${personName}`, false)
        getAll()
      })
    }
  }

  const handleNameChange = (event) => setNewName(event.target.value)
  const handleNumberChange = (event) => setNewNumber(event.target.value)
  const handleFilterChange = (event) => setNewFilter(event.target.value)

  return (
    <div>
      <h2>Phonebook</h2>
      
      <FilterForm value={newFilter} onChange={handleFilterChange} />

      <h2>Add a new contact</h2>
      <ContactAddingForm onSubmit={addName} name={newName} onNameChange={handleNameChange}
        number={newNumber} onNumberChange={handleNumberChange} />
      <Notification message={notificationMessage} isError={false} />
      <Notification message={errorMessage} isError={true} />
      <h2>Contacts</h2>
      <Contacts persons={persons} filter={newFilter} onClick={(personName, personId) => deleteName(personName, personId)} />
    </div>
  )
}

export default App