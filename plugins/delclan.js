import { getClan, deleteClan, getAllClanes } from '../../lib/clanes.js'
import fs from 'fs'
import path from 'path'

const DB_PATH = path.resolve('./database/clanes.json')
function saveDB(data){ fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2)) }

export default {
    comando: 'delclan',
    alias: ['borrarclan', 'eliminarclan'],
    category: 'freefire',
    group: true,
    execute: async (sock, chat, m) => {
        const db = getAllClanes()
        let clanId = null
        let clan = null

        // Buscar si es lider de algún clan por nombre o del grupo actual
        const nombreInput = m.text.split(' ').slice(1).join(' ').trim()

        if(nombreInput){
            for(const [id, c] of Object.entries(db)){
                if(c.nombre.toLowerCase() === nombreInput.toLowerCase()){
                    clanId = id
                    clan = c
                    break
                }
            }
        } else {
            // Si no pone nombre, busca el clan de este grupo
            clan = getClan(chat)
            clanId = chat
        }

        if(!clan){
            return sock.sendMessage(chat, { text: `❌ No encontré el clan ${nombreInput? `*${nombreInput}*` : 'de este grupo'}.` })
        }

        if(clan.lider!== m.sender){
            return sock.sendMessage(chat, { text: `⛔ Solo el líder @${clan.lider.split('@')[0]} puede borrar el clan *${clan.nombre}*`, mentions: [clan.lider] })
        }

        delete db[clanId]
        saveDB(db)

        await sock.sendMessage(chat, { text: `🗑️ Clan *${clan.nombre}* borrado con éxito.` })
    }
}