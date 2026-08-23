export default {
    comando: 'amistad',
    alias: ['amigorandom', 'amigos', 'friend'],
    category: 'juegos',
    cooldown: 1,
    execute: async (sock, chat, m) => {
        if (!chat.endsWith('@g.us')) {
            await sock.sendMessage(chat, { react: { text: '❌', key: m.key } })
            return sock.sendMessage(chat, { text: '❌ Solo en grupos.' })
        }

        try {
            const meta = await sock.groupMetadata(chat)
            let ps = meta.participants.map(v => v.id).filter(Boolean)

            if (ps.length < 2) {
                await sock.sendMessage(chat, { react: { text: '❌', key: m.key } })
                return sock.sendMessage(chat, { text: 'Necesito al menos 2 participantes.' })
            }

            const getRandom = () => ps[Math.floor(Math.random() * ps.length)]
            
            let a = getRandom()
            let b
            do {
                b = getRandom()
            } while (b === a)

            const toM = (jid) => `@${jid.split('@')[0]}`

            let texto = `💞 Vamos a hacer algunas amistades.\n\n*Oye ${toM(a)} háblale al privado a ${toM(b)} para que jueguen y se haga una amistad 🙆*\n\n*Las mejores amistades empiezan con un juego 😉.*`

            await sock.sendMessage(chat, { react: { text: '💞', key: m.key } })
            await sock.sendMessage(chat, {
                text: texto,
                mentions: [a, b]
            })

        } catch (err) {
            console.log(err)
            await sock.sendMessage(chat, { react: { text: '❌', key: m.key } })
            await sock.sendMessage(chat, { text: '❌ No pude hacer la amistad.' })
        }
    }
}