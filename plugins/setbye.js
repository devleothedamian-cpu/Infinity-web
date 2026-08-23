export default {
    comando: 'setbye',
    alias: ['setdespedida', 'despedida'],
    category: 'Admin',
    execute: async (sock, chat, m, args, { isAdmin, saveBan }) => {
        if(!chat.endsWith('@g.us')) {
            await sock.sendMessage(chat, { react: { text: '❌', key: m.key } })
            return sock.sendMessage(chat, { text: '❌ Solo en grupos' })
        }
        if(!isAdmin) {
            await sock.sendMessage(chat, { react: { text: '❌', key: m.key } })
            return sock.sendMessage(chat, { text: '❌ Solo admins' })
        }

        const texto = args.join(' ')
        if(!texto) {
            await sock.sendMessage(chat, { react: { text: '❓', key: m.key } })
            return sock.sendMessage(chat, {
                text: `✳️ *Uso:*.setbye [texto]\n\n*Variables disponibles:*\n@user = Menciona al usuario\n{group} = Nombre del grupo\n\n*Ejemplo:*\n.setbye 👋 @user salió de {group}`
            })
        }

        global.despedida[chat] = texto
        saveBan()
        await sock.sendMessage(chat, { react: { text: '✅', key: m.key } })
        sock.sendMessage(chat, { text: `✅ Mensaje de despedida configurado para este grupo` })
    }
}