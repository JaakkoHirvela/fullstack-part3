import axios from 'axios'
// const baseUrl = 'https://phonebook-backend-vney.onrender.com/api/persons'
 const baseUrl = '/api/persons' // For build version
// const baseUrl = 'http://localhost:3001/api/persons' // For local test version

const getPersons = () => {
  const request = axios.get(baseUrl)
  return request.then(response => response.data)
}

const addPerson = newPerson => {
  const request = axios.post(baseUrl, newPerson)
  return request.then(response => response.data)
}

const putPerson = (person, personId) => {
  console.log(person);
  const request = axios.put(`${baseUrl}/${personId}`, person)
  return request.then(response => response.data)
}

const deletePerson = personId => {
  console.log("url to delete from: ", `${baseUrl}/${personId}`);
  const request = axios.delete(`${baseUrl}/${personId}`)
  return request.then(response => response.status)
}

export default { getPersons, addPerson, deletePerson, putPerson }