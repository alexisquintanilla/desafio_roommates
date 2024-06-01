import { readFile, writeFile } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

const __dirname = import.meta.dirname

const getGastos = async (req, res) => {
    try {
        const data = await readFile(path.join(__dirname, '../data/gastos.json'), 'utf-8')
        const gastos = JSON.parse(data)
        res.json(gastos)
    } catch (error) {
        console.log(error)
    }
}

const postGastos = async (req, res) => {
    try {
        const { roommate, descripcion, monto } = req.body;

        if (!roommate || !descripcion || !monto || !roommate.trim() || !descripcion.trim()) {
            return res.status(400).json({ error: 'Los campos no pueden estar vacíos ni contener solo espacios.' });
        }

        const id = uuidv4().slice(0, 3)
        const newGasto = {
            id: id,
            roommate: roommate,
            descripcion: descripcion,
            monto: monto
        }

        const getRoommates = await readFile(path.join(__dirname, '../data/roommates.json'), 'utf-8')
        const roommates = JSON.parse(getRoommates)

        const getGastos = await readFile(path.join(__dirname, '../data/gastos.json'), 'utf-8')
        const gastos = JSON.parse(getGastos)

        const roommateIndex = roommates.roommates.findIndex(r => r.nombre === roommate);


        if (roommateIndex !== -1) {
            roommates.roommates[roommateIndex].debe -= monto;

            await writeFile(path.join(__dirname, '../data/roommates.json'), JSON.stringify(roommates))
        }

        gastos.gastos.push(newGasto)
        await writeFile(path.join(__dirname, '../data/gastos.json'), JSON.stringify(gastos))
        res.json(gastos)
    } catch (error) {
        console.error('Error al agregar un nuevo gasto:', error)
        res.status(500).json({ error: 'Hubo un error al procesar la solicitud', message: error.message })
    }
}


const deleteGastos = async (req, res) => {
    try {
        const { id } = req.query

        const getRoommates = await readFile(path.join(__dirname, '../data/roommates.json'), 'utf-8')
        const roommates = JSON.parse(getRoommates)

        const getGastos = await readFile(path.join(__dirname, '../data/gastos.json'), 'utf-8')
        const gastos = JSON.parse(getGastos)

        const gastoIndex = gastos.gastos.findIndex(g => g.id === id)
        const monto = gastos.gastos[gastoIndex].monto
        const roommate = gastos.gastos[gastoIndex].roommate

        const roommateIndex = roommates.roommates.findIndex(r => r.nombre === roommate)
        roommates.roommates[roommateIndex].debe += monto

        gastos.gastos.splice(gastoIndex, 1)

        await writeFile(path.join(__dirname, '../data/roommates.json'), JSON.stringify(roommates))
        await writeFile(path.join(__dirname, '../data/gastos.json'), JSON.stringify(gastos))

        res.json({ roommates, gastos })
    } catch (error) {
        console.error('Error al eliminar un gasto:', error)
        res.status(500).json({ error: 'Hubo un error al procesar la solicitud', message: error.message })
    }
}


const putGastos = async (req, res) => {
    try {
        const { id } = req.query
        const { roommate, descripcion, monto } = req.body;

        // Validación de los campos
        if (!roommate || !descripcion || !monto || !roommate.trim() || !descripcion.trim() || typeof monto !== 'number' || monto <= 0) {
            return res.status(400).json({ error: 'Los campos no pueden estar vacíos ni contener solo espacios y el monto debe ser un número positivo.' });
        }

        const getRoommates = await readFile(path.join(__dirname, '../data/roommates.json'), 'utf-8')
        const roommates = JSON.parse(getRoommates)

        const getGastos = await readFile(path.join(__dirname, '../data/gastos.json'), 'utf-8')
        const gastos = JSON.parse(getGastos)

        const gastoIndex = gastos.gastos.findIndex(g => g.id === id)
        const oldMonto = gastos.gastos[gastoIndex].monto
        const oldRoommate = gastos.gastos[gastoIndex].roommate

        const roommateIndex = roommates.roommates.findIndex(r => r.nombre === oldRoommate)
        roommates.roommates[roommateIndex].debe += oldMonto

        gastos.gastos[gastoIndex].roommate = roommate.trim()
        gastos.gastos[gastoIndex].descripcion = descripcion.trim()
        gastos.gastos[gastoIndex].monto = monto

        const newRoommateIndex = roommates.roommates.findIndex(r => r.nombre === roommate.trim())
        roommates.roommates[newRoommateIndex].debe -= monto

        await writeFile(path.join(__dirname, '../data/roommates.json'), JSON.stringify(roommates))
        await writeFile(path.join(__dirname, '../data/gastos.json'), JSON.stringify(gastos))

        res.json({ roommates, gastos })
    } catch (error) {
        console.error('Error al editar un gasto:', error)
        res.status(500).json({ error: 'Hubo un error al procesar la solicitud', message: error.message })
    }
}

export const controllerGastos = {
    getGastos,
    postGastos,
    deleteGastos,
    putGastos
}