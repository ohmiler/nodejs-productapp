const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
    res.send('Users home page')
})

router.get('/:id', (req, res) => {
    res.send(`User ID: ${req.params.id}`)
})

module.exports = router