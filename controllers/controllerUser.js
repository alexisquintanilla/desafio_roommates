import path from 'path'
import { readFile, writeFile } from 'fs/promises'
import axios from 'axios'

const __dirname = import.meta.dirname

const getRoommates = async (req, res) => {
    try {
        const data = await readFile(path.join(__dirname, '../data/roommates.json'), 'utf-8')
        const roommates = JSON.parse(data)
        res.json(roommates)
    } catch (error) {
        console.error('Error al cargar los roommates :', error)
        res.status(500).json({ error: 'Hubo un error al procesar la solicitud', message: error.message })
    }
}

const postRoommate = async (req, res) => {
    try {
        const { data } = await axios('https://randomuser.me/api')
        const newUser = {
            nombre: data.results[0].name.first,
            debe: 0,
            recibe: 0
        }
        const getroommates = await readFile(path.join(__dirname, '../data/roommates.json'), 'utf-8')
        const roommates = JSON.parse(getroommates)
        roommates.roommates.push(newUser)
        await writeFile(path.join(__dirname, '../data/roommates.json'), JSON.stringify(roommates))
        res.json(roommates)
    } catch (error) {
        console.error('Error al agregar un nuevo roommate:', error)
        res.status(500).json({ error: 'Hubo un error al procesar la solicitud', message: error.message })
    }
}

export const controllerRoommate = {
    getRoommates,
    postRoommate
}