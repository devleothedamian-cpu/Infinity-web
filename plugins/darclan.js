import { getAllClanes } from '../../lib/clanes.js'
import fs from 'fs'
import path from 'path'

const DB_PATH = path.resolve('./database/clanes.json')
function saveDB(data){ fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2)) }

export default {
    comando: 'darclan',
    alias: ['transferirclan', 'liderclan'],
    category: 'freefire',
    group: true,
    execute: async (sock, chat, m) => {
        const db = getAllClanes()

        // Detectar a quién darle
        const mencionado = m.mentionedJid?.[0] || m.quoted?.sender
        if(!mencionado){
            return sock.sendMessage(chat, { text: `✳️ Usa: *.darclan @usuario [nombre clan]*\nEj: *.darclan @Leo LOS TOXICOS*` })
        }

        const args = m.text.split(' ').slice(1)
        // Si menciona, el nombre del clan puede venir después
        let nombreInput = args.filter(a =>!a.startsWith('@')).join(' ').trim()

        let clanId = null
        let clan = null

        if(nombreInput){
            for(const [id, c] of Object.entries(db)){
                if(c.nombre.toLowerCase() === nombreInput.toLowerCase()){
                    clanId = id
                    clan = c
                    break
                }
            }
        } else {
            // Buscar clan de este grupo
            const { getClan } = await import('../../lib/clanes.js')
            clan = getClan(chat)
            clanId = chat
            if(clan) nombreInput = clan.nombre
        }

        if(!clan){
            return sock.sendMessage(chat, { text: `❌ No encontré el clan *${nombreInput || ''}*` })
        }

        if(clan.lider!== m.sender){
            return sock.sendMessage(chat, { text: `⛔ Solo el líder actual puede transferir el clan.`, mentions: [clan.lider] })
        }

        if(!clan.miembros.includes(mencionado)){
            return sock.sendMessage(chat, { text: `⚠️ El usuario @${mencionado.split('@')[0]} no está en el clan *${clan.nombre}*`, mentions: [mencionado] })
        }

        db[clanId].lider = mencionado
        saveDB(db)

        const texto = `👑 *LIDERAZGO TRANSFERIDO*\n\n⸙ Clan: *${clan.nombre}*\n⸙ Nuevo líder: @${mencionado.split('@')[0]}\n⸙ Anterior líder: @${m.sender.split('@')[0]}`

        await sock.sendMessage(chat, { text: texto, mentions: [mencionado, m.sender] })
    }
}