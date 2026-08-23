import { getClan, updateClan } from '../../lib/clanes.js'

export default {
    comando: 'salirclan',
    alias: ['leaveclan', 'salir'],
    category: 'freefire',
    group: true,
    execute: async (sock, chat, m) => {
        const clan = getClan(chat)
        if(!clan){
            return sock.sendMessage(chat, { text: `❌ No hay clan en este grupo.` })
        }

        if(!clan.miembros.includes(m.sender)){
            return sock.sendMessage(chat, { text: `⚠️ No estás en el clan *${clan.nombre}*` })
        }

        if(clan.lider === m.sender){
            return sock.sendMessage(chat, {
                text: `👑 Eres el líder, no puedes salir así.\nUsa *.delclan* para borrar el clan o transfiere el liderazgo.`
            })
        }

        clan.miembros = clan.miembros.filter(jid => jid !== m.sender)
        updateClan(chat, { miembros: clan.miembros })

        const texto = `👋 *@${m.sender.split('@')[0]}* salió del clan *${clan.nombre}*\n\n⸙ ⌗⊹₊ Miembros ahora: ${clan.miembros.length}`

        await sock.sendMessage(chat, { text: texto, mentions: [m.sender] })
    }
}