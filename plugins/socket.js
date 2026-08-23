export default {
    comando: 'socket',
    alias: ['asignar'],
    category: 'Subbots',

    execute: async (sock, chat, m, args, { isOwner, botJid }) => {
        if(!isOwner) return sock.sendMessage(chat, { text: `❌ Solo owner` })

        const target = m.message.extendedTextMessage?.contextInfo?.participant
        if(!target &&!args[0]) return sock.sendMessage(chat, { text: `*Uso:*.socket @mencion o responde a un mensaje` })

        const jid = target || args[0] + '@s.whatsapp.net'
        global.socketAsignado[chat] = botJid

        await sock.sendMessage(chat, { text: `✅ *BOT ASIGNADO*\nAhora solo responderé yo en este grupo.\nOwner: @${jid.split('@')[0]}`, mentions: [jid] })
    }
}