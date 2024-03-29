const express = require('express')
const { randomBytes } = require('crypto')
const cors = require('cors')
const axios = require('axios')

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const PORT = 4000

const posts = {}

app.post('/posts/create', async (req, res) => {
    const id = randomBytes(4).toString('hex')
    const { title } = req.body

    posts[id] = {
        id, title
    }


    await axios.post('http://event-bus-srv:4005/events', {
        type: 'PostCreated',
        data: {
            id, title
        }
    }).catch((err) => {
        console.log('Error emitting event: ', err.message);
    })

    res.status(201).send(posts[id])
})

app.post('/events', (req, res) => {
    console.log('Received Event: ', req.body.type);

    res.send({})
})

app.listen(PORT, () => {
    console.log('v55');
    console.log(`Listening on ${PORT}`);
})