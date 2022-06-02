const express = require('express')
const { randomBytes } = require('crypto')
const cors = require('cors')
const axios = require('axios')

const app = express()
app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

const PORT = 4001

const commentsByPostId = {}

app.get('/posts/:id/comments', (req, res) => {
    res.send(commentsByPostId[req.params.id] || [])
})

app.post('/posts/:id/comments', async (req, res) => {
    const commentId = randomBytes(4).toString('hex')
    const { content } = req.body

    const comments = commentsByPostId[req.params.id] || []
    comments.push({ id: commentId, content, status: 'pending' })

    commentsByPostId[req.params.id] = comments

    await axios.post('http://event-bus-srv:4005/events', {
        type: 'CommentCreated',
        data: {
            id: commentId,
            content,
            postId: req.params.id,
            status: 'pending'
        }

    }).catch((err) => {
        console.log('Error posting comment: ', err.message);
    })

    res.status(201).send(comments)
})

app.post('/events', async (req, res) => {
    console.log('Event received: ', req.body.type);

    const { type, data } = req.body

    if (type === 'CommentModerated') {
        const { postId, id, status, content } = data

        const comments = commentsByPostId[postId]

        const comment = comments.find(comment => comment.id === id)
        comment.status = status

        await axios.post('http://event-bus-srv:4005/events', {
            type: 'CommentUpdated',
            data: {
                id,
                status,
                postId,
                content
            }
        })
    }

    res.send({})
})

app.listen(PORT, () => {
    console.log(`Listening on ${PORT}...`);
})