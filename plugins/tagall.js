export default {
    comando: 'tagall',
    alias: ['hidetag', 'todos', 'invocar'],
    category: 'grupos',
    execute: async (sock, chat, m) => {
        if (!chat.endsWith('@g.us')) {
            await sock.sendMessage(chat, { react: { text: '❌', key: m.key } })
            return sock.sendMessage(chat, { text: '❌ Solo en grupos.' })
        }

        try {
            const meta = await sock.groupMetadata(chat)
            const participante = meta.participants.find(p => p.id === m.sender)
            const esAdmin = participante?.admin === 'admin' || participante?.admin === 'superadmin'

            if (!esAdmin) {
                await sock.sendMessage(chat, { react: { text: '⛔', key: m.key } })
                return sock.sendMessage(chat, { text: '⛔ lo siento no tienes permisos de admin' })
            }

            const participantes = meta.participants.map(p => p.id)
            const textoExtra = m.text.split(' ').slice(1).join(' ').trim()
            const texto = textoExtra || `📢 Mención general (${participantes.length} miembros)`

            await sock.sendMessage(chat, { react: { text: '📢', key: m.key } })
            await sock.sendMessage(chat, { text: texto, mentions: participantes })

        } catch (err) {
            console.log(err)
            await sock.sendMessage(chat, { react: { text: '❌', key: m.key } })
            await sock.sendMessage(chat, { text: '❌ No pude mencionar a todos.' })
        }
    }
}