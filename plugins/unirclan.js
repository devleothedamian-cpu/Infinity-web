import { getAllClanes, updateClan } from '../../lib/clanes.js'
import fs from 'fs'
import path from 'path'

const DB_PATH = path.resolve('./database/clanes.json')

function saveDB(data){
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2))
}

export default {
    comando: 'unirclan',
    alias: ['joinclan', 'unir'],
    category: 'freefire',
    group: true,
    execute: async (sock, chat, m) => {
        const nombreInput = m.text.split(' ').slice(1).join(' ').trim()

        if(!nombreInput){
            return sock.sendMessage(chat, {
                text: `✳️ Usa: *.unirclan [nombre del clan]*\nEj: *.unirclan LOS TOXICOS*`
            })
        }

        const db = getAllClanes() // { chatId: {nombre, miembros...} }
        // Buscar clan por nombre (sin importar mayúsculas)
        let clanId = null
        let clan = null

        for(const [id, c] of Object.entries(db)){
            if(c.nombre.toLowerCase() === nombreInput.toLowerCase()){
                clanId = id
                clan = c
                break
            }
        }

        if(!clan){
            return sock.sendMessage(chat, {
                text: `❌ No encontré el clan *${nombreInput}*\nVerifica el nombre con *.clanes*`
            })
        }

        if(clan.miembros.includes(m.sender)){
            return sock.sendMessage(chat, { text: `⚠️ Ya estás dentro del clan *${clan.nombre}*` })
        }

        clan.miembros.push(m.sender)
        db[clanId].miembros = clan.miembros
        saveDB(db)

        const texto = `✅ *@${m.sender.split('@')[0]}* se unió al clan *${clan.nombre}*\n\n⸙ ⌗⊹₊ Tag: ${clan.tag}\n⸙ ⌗⊹₊ Miembros ahora: ${clan.miembros.length}`

        await sock.sendMessage(chat, { text: texto, mentions: [m.sender] })
    }
}