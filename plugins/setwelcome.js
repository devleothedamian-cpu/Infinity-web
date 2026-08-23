export default {
    comando: 'setwelcome',
    alias: ['setbienvenida', 'bienvenida'],
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
                text: `✳️ *Uso:*.setwelcome [texto]\n\n*Variables disponibles:*\n@user = Menciona al usuario\n{group} = Nombre del grupo\n{nombreBot} = Nombre del bot\n\n*Ejemplo:*\n.setwelcome *😎 Bienvenido @user a {group}*\n_*» soy {nombreBot} usa.menu*_`
            })
        }

        global.bienvenida[chat] = texto
        saveBan()
        await sock.sendMessage(chat, { react: { text: '✅', key: m.key } })
        sock.sendMessage(chat, { text: `✅ Mensaje de bienvenida configurado para este grupo` })
    }
}