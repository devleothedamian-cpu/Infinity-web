import settings from '../../settings.js'

export default {
    comando: 'salir',
    alias: ['leave', 'out'],
    category: 'owner',
    execute: async (sock, chat, m) => {
        try {
            const senderNum = m.sender.split('@')[0]
            const isOwner = global.owner?.includes(senderNum) || settings.owner?.includes(senderNum)

            if (!isOwner) {
                return await sock.sendMessage(chat, { text: '⛔ *Solo mi creador puede usar este comando.*' })
            }

            if (!m.isGroup) {
                return await sock.sendMessage(chat, { text: '⛔ Usa este comando dentro de un grupo para salir de él.' })
            }

            await sock.sendMessage(chat, { react: { text: '🌠', key: m.key } })

            await sock.sendMessage(chat, {
                text: `╭━━━━━『𝗕𝗢𝗧 𝗦𝗔𝗟𝗜𝗘𝗡𝗗𝗢 🥷』━━━━━╮\n┃ 👋 _${global.nombreBot || settings.nombreBot || 'INFINITY'} se despide_\n╰━━━━━━━━━━━━━━━╯`
            })

            await sock.sendMessage(chat, { react: { text: '✅', key: m.key } })

            setTimeout(async () => {
                await sock.groupLeave(chat)
            }, 2500)

        } catch (e) {
            console.log(e)
            await sock.sendMessage(chat, { react: { text: '⚠️', key: m.key } })
            await sock.sendMessage(chat, { text: `💥 *Error crítico:* No pude salir del grupo.` })
        }
    }
}