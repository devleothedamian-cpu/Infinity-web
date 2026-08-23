import { getClan } from '../../lib/clanes.js'

export default {
    comando: 'clan',
    alias: ['miclan'],
    category: 'freefire',
    group: true,
    execute: async (sock, chat, m) => {
        const clan = getClan(chat)
        if(!clan){
            return sock.sendMessage(chat, {
                text: `❌ No hay clan en este grupo.\nUsa *.crearclan [nombre]*`
            })
        }

        const nivel = clan.nivel || 1
        const exp = clan.exp || 0
        const expParaSubir = nivel * 1000
        const barra = Math.floor((exp / expParaSubir) * 10)
        const progreso = '█'.repeat(barra) + '░'.repeat(10 - barra)

        const texto = `╭─────>⋆☽⋆🔫⋆☾⋆<─────╮
   🥷 𝘾𝙇𝘼𝙉: ${clan.nombre}
╰─────>⋆☽⋆🔫⋆☾⋆<─────╯
⸙ ⌗⊹₊ Tag: ${clan.tag}
⸙ ⌗⊹₊ Líder: @${clan.lider.split('@')[0]}
⸙ ⌗⊹₊ Nivel: ${nivel} | Exp: ${exp}/${expParaSubir}
⸙ ⌗⊹₊ [${progreso}] ${Math.floor((exp/expParaSubir)*100)}%
⸙ ⌗⊹₊ Miembros: ${clan.miembros.length} / 30
⸙ ⌗⊹₊ Región: ${clan.region || 'SUD'}
⸙ ⌗⊹₊ Victorias: ${clan.vs || 0}`

        await sock.sendMessage(chat, { text: texto, mentions: [clan.lider] })
    }
}