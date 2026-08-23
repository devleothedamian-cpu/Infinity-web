export default {
    comando: 'damelid',
    alias: ['getlid', 'lid', 'id'],
    category: 'tools',
    cooldown: 2,
    group: false,
    execute: async (sock, chat, m) => {
        await sock.sendMessage(chat, { react: { text: '🛰️', key: m.key } })

        // Si responden a alguien, agarra al citado, si no al sender
        const context = m.message?.extendedTextMessage?.contextInfo
        const citado = context?.participant || context?.mentionedJid?.[0]
        const senderId = m.sender

        const objetivo = citado || senderId
        const tipo = objetivo.endsWith('@lid')? 'LID oculto (@lid)' : 'Número visible (@s.whatsapp.net)'
        const numero = objetivo.replace(/[^0-9]/g, '') || 'Oculto'

        const mensaje = `📡 *IDENTIFICADOR*\n\n👤 *Usuario:* ${objetivo}\n🔢 *Número:* +${numero}\n🔐 *Tipo:* ${tipo}\n\n💬 *Chat:* ${chat}`

        await sock.sendMessage(chat, { text: mensaje.trim() }, { quoted: m })
    }
}