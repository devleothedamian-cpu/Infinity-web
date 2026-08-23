import { getAllClanes } from '../../lib/clanes.js'
import fs from 'fs'
import path from 'path'

const DB_PATH = path.resolve('./database/clanes.json')
function saveDB(data){ fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2)) }

export default {
    comando: 'kickclan',
    alias: ['expulsarclan', 'sacarclan'],
    category: 'freefire',
    group: true,
    execute: async (sock, chat, m) => {
        const db = getAllClanes()

        const mencionado = m.mentionedJid?.[0] || m.quoted?.sender
        const rawArgs = m.text.split(' ').slice(1).join(' ').trim()
        const soloNumeros = rawArgs.replace(/[^0-9]/g, '')

        if(!mencionado &&!rawArgs){
            return sock.sendMessage(chat, {
                text: `✳️ Usa:\n*.kickclan @usuario*\n*.kickclan 521234567890*\n*.kickclan Leo*`
            })
        }

        // Buscar clan del grupo actual
        let clanId = chat
        let clan = null

        // Buscar por nombre de clan si lo escriben
        for(const [id, c] of Object.entries(db)){
            if(rawArgs.toLowerCase().includes(c.nombre.toLowerCase())){
                clanId = id
                clan = c
                break
            }
        }
        if(!clan){
            const { getClan } = await import('../../lib/clanes.js')
            clan = getClan(chat)
        }

        if(!clan){
            return sock.sendMessage(chat, { text: `❌ No hay clan en este grupo.` })
        }

        if(clan.lider!== m.sender){
            return sock.sendMessage(chat, { text: `⛔ Solo el líder puede expulsar.`, mentions: [clan.lider] })
        }

        let jidAExpulsar = mencionado

        // 1. Por número
        if(!jidAExpulsar && soloNumeros.length >= 8){
            jidAExpulsar = clan.miembros.find(j => j.includes(soloNumeros))
            if(!jidAExpulsar) jidAExpulsar = soloNumeros + '@s.whatsapp.net'
        }

        // 2. Por nombre/numero escrito
        if(!jidAExpulsar){
            const nombreVictima = rawArgs.toLowerCase().replace(clan.nombre.toLowerCase(), '').trim()
            jidAExpulsar = clan.miembros.find(jid =>
                jid.toLowerCase().includes(nombreVictima) ||
                jid.split('@')[0].includes(nombreVictima)
            )
        }

        if(!jidAExpulsar){
            return sock.sendMessage(chat, { text: `❌ No encontré a *${rawArgs}* en *${clan.nombre}*` })
        }

        if(!clan.miembros.includes(jidAExpulsar)){
            return sock.sendMessage(chat, { text: `⚠️ Ese usuario no está en el clan.` })
        }

        if(jidAExpulsar === clan.lider){
            return sock.sendMessage(chat, { text: `⚠️ No puedes expulsar al líder.` })
        }

        db[clanId].miembros = clan.miembros.filter(j => j!== jidAExpulsar)
        saveDB(db)

        await sock.sendMessage(chat, {
            text: `🥾 *@${jidAExpulsar.split('@')[0]}* expulsado del clan *${clan.nombre}*\nMiembros: ${db[clanId].miembros.length}`,
            mentions: [jidAExpulsar]
        })
    }
}