import express from 'express'

import routerUser from './router/routerUser.js'
import routerGastos from './router/routerGastos.js'


const __dirname = import.meta.dirname

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/public'))

app.use('/', routerUser)
app.use('/', routerGastos)


const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log('SERVIDOR CORRIENDO EN PUERTO : ' + PORT)
})