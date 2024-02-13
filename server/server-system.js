const express = require('express')
const path = require('path')

const app = express()
const PORT = 3000

app.get('/', (_req, res) => {
    // res.send(path.join(__dirname, '../public'))
    res.sendFile('index.html', {root: path.join(__dirname, '../public') })
})

app.listen(PORT, () => console.log('Running in port ' + PORT))
