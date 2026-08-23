import { getClan, createClan } from '../../lib/clanes.js'

export default {
    comando: 'crearclan',
    alias: ['newclan', 'creaclan'],
    category: 'freefire',
    group: true,
    cooldown: 5,
    execute: async (sock, chat, m) => {
        const nombre = m.text.split(' ').slice(1).join(' ').trim()

        if(!nombre){
            return sock.sendMessage(chat, {
                text: `✳️ Usa: *.crearclan [nombre]*\nEj: *.crearclan LOS TOXICOS*`
            })
        }

        const existente = getClan(chat)
        if(existente){
            return sock.sendMessage(chat, {
                text: `⚠️ Ya existe un clan en este grupo: *${existente.nombre}*\nUsa *.clan* para verlo o *.delclan* para borrarlo.`
            })
        }

        const tag = nombre.slice(0, 3).toUpperCase().replace(/\s/g, '')
        
        const nuevo = createClan(chat, {
            nombre: nombre,
            tag: tag,
            lider: m.sender,
            miembros: [m.sender],
            nivel: 1,
            exp: 0,
            region: "SUD",
            vs: 0
        })

        const texto = `╭─────>⋆☽⋆🔫⋆☾⋆<─────╮
   ✅ 𝘾𝙇𝘼𝙉 𝘾𝙍𝙀𝘼𝘿𝙊
╰─────>⋆☽⋆🔫⋆☾⋆<─────╯
⸙ ⌗⊹₊ Nombre: ${nuevo.nombre}
⸙ ⌗⊹₊ Tag: ${nuevo.tag}
⸙ ⌗⊹₊ Líder: @${m.sender.split('@')[0]}
⸙ ⌗⊹₊ Nivel: 1
⸙ ⌗⊹₊ Región: ${nuevo.region}

> Usa *.clan* para ver info`

        await sock.sendMessage(chat, { text: texto, mentions: [m.sender] })
    }
}