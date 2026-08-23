export default {
    comando: 'menuff',
    alias: ['ffmenu', 'menufreefire', 'freefiremenu'],
    category: 'freefire',
    cooldown: 3,
    group: false,
    execute: async (sock, chat, m) => {
        const prefix = m.prefix || '.'
        const allCommands = global.commands || global.comandos || []
        const ffCommands = allCommands.filter(c => c.category === 'freefire')

        let lista = ""
        if (ffCommands.length === 0) {
            lista = `⸙ ⌗⊹₊ ${prefix}1vs1\n⸙ ⌗⊹₊ ${prefix}2vs2\n⸙ ⌗⊹₊ ${prefix}3vs3\n⸙ ⌗⊹₊ ${prefix}4vs4\n⸙ ⌗⊹₊ ${prefix}6vs6\n⸙ ⌗⊹₊ ${prefix}8vs8\n⸙ ⌗⊹₊ ${prefix}12vs12\n⸙ ⌗⊹₊ ${prefix}16vs16\n⸙ ⌗⊹₊ ${prefix}20vs20\n⸙ ⌗⊹₊ ${prefix}mapas`
        } else {
            lista = ffCommands
                .filter(c => c.comando !== 'menuff')
                .map(c => `⸙ ⌗⊹₊ ${prefix}${c.comando}`)
                .join("\n")
        }

        const texto = `╭─────>⋆☽⋆🔫⋆☾⋆<─────╮
   🥷 𝙁𝙍𝙀𝙀 𝙁𝙄𝙍𝙀 𝙈𝙀𝙉𝙐 🌠
╰─────>⋆☽⋆🔫⋆☾⋆<─────╯
${lista}
🧑‍💻 *Desarrollado por —͟͞모ⁱᵃᵐ Dev Leo.xyz*`

        await sock.sendMessage(chat, { react: { text: '🔥', key: m.key } })
        await sock.sendMessage(chat, { 
            image: { url: "https://raw.githubusercontent.com/JTxs00/uploads/main/1787199248097.jpeg" },
            caption: texto
        }, { quoted: m })
    }
}