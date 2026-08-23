export default {
    comando: 'delete',
    alias: ['del', 'd'],
    category: 'Owner',

    execute: async (sock, chat, m, args, { isOwner, isCreador, isBotAdmin }) => {
        if (!isOwner &&!isCreador &&!global.owner.includes(m.sender.split('@')[0])) {
            await sock.sendMessage(chat, {
                text: global.mensajes.sinPermiso,
                react: { text: '❌', key: m.key }
            }, { quoted: m })
            return
        }

        if (!m.quoted) {
            await sock.sendMessage(chat, {
                text: `📝 *Uso:* Responde al mensaje que quieres borrar con.delete`,
                react: { text: '📝', key: m.key }
            }, { quoted: m })
            return
        }

        const esPropio = m.quoted.sender === sock.user.id
        const esGrupo = chat.endsWith('@g.us')

        try {
            if (!esPropio && esGrupo &&!isBotAdmin) {
                await sock.sendMessage(chat, {
                    text: `✳️ *Necesito ser admin para borrar mensajes de usuarios.*`,
                    react: { text: '❌', key: m.key }
                }, { quoted: m })
                return
            }

            await sock.sendMessage(chat, { delete: m.quoted.key })

            await sock.sendMessage(chat, {
                react: { text: '🗑️', key: m.key }
            })

        } catch (e) {
            await sock.sendMessage(chat, {
                text: `❌ No pude borrar ese mensaje. Solo se pueden borrar mensajes de hasta 2 horas.`,
                react: { text: '❌', key: m.key }
            }, { quoted: m })
        }
    }
}