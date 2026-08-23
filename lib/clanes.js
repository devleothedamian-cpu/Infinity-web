import fs from 'fs'
import path from 'path'

const DB_PATH = path.resolve('./database/clanes.json')

// Crear carpeta/archivo si no existe
if (!fs.existsSync(path.dirname(DB_PATH))) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })
}
if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({}, null, 2))
}

function getDB() {
    try {
        return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'))
    } catch {
        return {}
    }
}

function saveDB(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2))
}

// Obtener clan por ID de grupo
export function getClan(chatId) {
    const db = getDB()
    return db[chatId] || null
}

// Obtener todos los clanes
export function getAllClanes() {
    return getDB()
}

// Buscar clan por nombre
export function getClanByNombre(nombre) {
    const db = getDB()
    return Object.values(db).find(c => c.nombre.toLowerCase() === nombre.toLowerCase()) || null
}

// Crear clan
export function createClan(chatId, data) {
    const db = getDB()
    const nuevo = {
        id: chatId,
        nombre: data.nombre,
        tag: data.tag || data.nombre.slice(0,3).toUpperCase(),
        lider: data.lider,
        miembros: data.miembros || [data.lider],
        nivel: data.nivel || 1,
        exp: data.exp || 0,
        region: data.region || "SUD",
        vs: data.vs || 0,
        actividad: data.actividad || [], // para clanhonor
        creado: Date.now()
    }
    db[chatId] = nuevo
    saveDB(db)
    return nuevo
}

// Borrar clan
export function deleteClan(chatId) {
    const db = getDB()
    if (db[chatId]) {
        delete db[chatId]
        saveDB(db)
        return true
    }
    return false
}

// Agregar exp y subir nivel automático
export function addExp(chatId, cantidad) {
    const db = getDB()
    if (!db[chatId]) return null

    db[chatId].exp = (db[chatId].exp || 0) + cantidad

    let subio = false
    while (db[chatId].exp >= (db[chatId].nivel * 1000)) {
        db[chatId].exp -= db[chatId].nivel * 1000
        db[chatId].nivel += 1
        subio = true
    }

    saveDB(db)
    return { clan: db[chatId], subio }
}

// Agregar actividad para honor
export function addActividad(chatId, jid, tipo, exp) {
    const db = getDB()
    if (!db[chatId]) return null
    db[chatId].actividad = db[chatId].actividad || []
    db[chatId].actividad.push({
        jid,
        tipo,
        exp,
        fecha: Date.now()
    })
    saveDB(db)
}