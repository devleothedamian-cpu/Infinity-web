export default {
    comando: 'cerrargrupo',
    alias: ['cerrar', 'close', 'cerrarchat'],
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

            await sock.sendMessage(chat, { react: { text: '⏳', key: m.key } })
            await sock.groupSettingUpdate(chat, 'announcement')
            await sock.sendMessage(chat, { react: { text: '🔒', key: m.key } })
            await sock.sendMessage(chat, { text: '🔒 Grupo cerrado, solo admins pueden escribir.' })

        } catch (err) {
            console.log(err)
            await sock.sendMessage(chat, { react: { text: '❌', key: m.key } })
            await sock.sendMessage(chat, { text: '❌ No pude cerrar el grupo, hazme admin.' })
        }
    }
}