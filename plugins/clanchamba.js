import { getClan } from '../../lib/clanes.js'
import fs from 'fs'
const DB_PATH = './database/clanes.json'
const save = d => fs.writeFileSync(DB_PATH, JSON.stringify(d,null,2))

export default {
    comando: 'clanchamba',
    alias: ['chambaclan'],
    category: 'freefire',
    group: true,
    cooldown: 300,
    execute: async (sock, chat, m) => {
        const clan = getClan(chat)
        if(!clan) return sock.sendMessage(chat,{text:`❌ No hay clan.`})
        if(!clan.miembros.includes(m.sender)) return sock.sendMessage(chat,{text:`⛔ No eres del clan.`})

        const expGanada = 50
        const db = JSON.parse(fs.readFileSync(DB_PATH))
        const id = Object.keys(db).find(k => db[k].nombre === clan.nombre) || chat

        db[id].exp = (db[id].exp||0) + expGanada
        db[id].actividad = db[id].actividad || []
        db[id].actividad.push({ jid: m.sender, tipo: 'CHAMBA', exp: expGanada, fecha: Date.now() })

        let nivel = db[id].nivel||1
        if(db[id].exp >= nivel*1000){
            db[id].exp -= nivel*1000
            db[id].nivel = nivel+1
        }
        save(db)

        const texto = `✞͙͙͙͙͙͙͙͙͙͙⏜❟︵ֹ̩̥̩̥̩̥̩̩̥੭🌠୧ֹ︵ֹ̩̥̩̥̩̥̩̥̩̥̩̥̩̥❟⏜፞✞͙͙͙͙͙͙͙͙͙͙.
├┈ ↷ *CLAN*
├• ✐; ₊ *CHAMBA*.
├┈・──・──・﹕₊˚ ✦・
*@${m.sender.split('@')[0]} Hizo su trabajo como integrante del clan ${clan.nombre} y gano ${expGanada} exp*`

        await sock.sendMessage(chat,{text: texto, mentions:[m.sender]})
    }
}