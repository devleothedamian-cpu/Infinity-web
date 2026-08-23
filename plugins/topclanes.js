import { getAllClanes } from '../../lib/clanes.js'

export default {
    comando: 'clanestop',
    alias: ['topclanes', 'topclan'],
    category: 'freefire',
    group: false,
    execute: async (sock, chat, m) => {
        const db = getAllClanes()

        const lista = Object.values(db)

        if(!lista.length){
            return sock.sendMessage(chat, { text: `❌ Aún no hay clanes creados.` })
        }

        // Ordenar por nivel descendente
        const top = lista.sort((a,b) => (b.nivel || 1) - (a.nivel || 1)).slice(0, 10)

        let texto = `╭─────>⋆☽⋆🏆⋆☾⋆<─────╮\n   🔥 𝙏𝙊𝙋 𝘾𝙇𝘼𝙉𝙀𝙎 🔥\n╰─────>⋆☽⋆🏆⋆☾⋆<─────╯\n\n`

        top.forEach((clan, i) => {
            const medalla = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `*${i+1}.*`
            texto += `${medalla} *${clan.nombre}* [${clan.tag || 'SIN TAG'}]\n`
            texto += `   ⸙ Nivel: ${clan.nivel || 1} | Miembros: ${clan.miembros?.length || 0}\n`
            texto += `   ⸙ Líder: @${clan.lider?.split('@')[0] || '???'}\n\n`
        })

        texto += `> Usa *.clan* en su grupo para ver detalles`

        const menciones = top.map(c => c.lider).filter(Boolean)

        await sock.sendMessage(chat, { text: texto, mentions: menciones })
    }
}