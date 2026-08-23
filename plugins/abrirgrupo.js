import { esBotAdminGrupo } from '../../lib/groupPermissions.js'

export default {
    comando: 'abrirgrupo',
    alias: ['abrir', 'open', 'abrirchat'],
    category: 'grupos',
    desc: 'Permite que todos los miembros puedan escribir en el grupo',
    cooldown: 3,
    soloAdmin: true,
    execute: async (sock, chat, m) => {
        const chatId = chat

        if (!chatId.endsWith('@g.us')) {
            await sock.sendMessage(chat, { react: { text: '❌', key: m.key } })
            return sock.sendMessage(chat, { text: '❌ Este comando solo funciona en grupos.' })
        }

        const botEsAdmin = await esBotAdminGrupo(sock, chatId)
        if (!botEsAdmin) {
            await sock.sendMessage(chat, { react: { text: '❌', key: m.key } })
            return sock.sendMessage(chat, { text: '❌ Necesito ser administrador para hacer esto.' })
        }

        try {
            await sock.sendMessage(chat, { react: { text: '⏳', key: m.key } })
            await sock.groupSettingUpdate(chatId, 'not_announcement')
            await sock.sendMessage(chat, { react: { text: '🔓', key: m.key } })
            await sock.sendMessage(chat, {
                text: `🔓 *Grupo abierto*\n\nTodos los miembros pueden escribir de nuevo.\n\n> Tipo: ${sock.tipo || global.tipo || 'Principal'}`,
            })
        } catch (err) {
            console.error('Error abriendo el grupo:', err)
            await sock.sendMessage(chat, { react: { text: '❌', key: m.key } })
            await sock.sendMessage(chat, { text: '❌ No pude cambiar la configuración del grupo.' })
        }
    }
}