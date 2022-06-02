const express = require('express')
const axios = require('axios')

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const PORT = 4003

app.post('/events', async (req, res) => {
    const { type, data } = req.body

    if (type === 'CommentCreated') {
        const status = data.content.includes('orange') ? 'rejected' : 'approved'


        await axios.post('http://event-bus-srv:4005/events', {
            type: 'CommentModerated',
            data: {
                id: data.id,
                postId: data.postId,
                status,
                content: data.content
            }
        }).catch((err) => {
            console.log('Error moderating comment: ', err.message);
        })
    }

    res.send({})
})

app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
})