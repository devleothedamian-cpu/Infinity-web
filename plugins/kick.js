export default {
    comando: 'kick',
    alias: ['expulsar', 'sacar', 'echar'],
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

            // Sacar JID del mencionado / respondido / número
            let jid = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
                   || m.message?.extendedTextMessage?.contextInfo?.participant

            if (!jid) {
                let texto = m.text.split(' ').slice(1).join(' ')
                let numero = texto.replace(/\D/g, '')
                if (numero) jid = numero + '@s.whatsapp.net'
            }

            if (!jid) {
                await sock.sendMessage(chat, { react: { text: '❌', key: m.key } })
                return sock.sendMessage(chat, { text: '❀ Menciona, responde o escribe el número de quien quieres expulsar.' })
            }

            await sock.sendMessage(chat, { react: { text: '⏳', key: m.key } })
            await sock.groupParticipantsUpdate(chat, [jid], 'remove')
            await sock.sendMessage(chat, { react: { text: '✅', key: m.key } })

            const num = jid.split('@')[0]
            await sock.sendMessage(chat, {
                text: `✅ @${num} fue expulsado.`,
                mentions: [jid]
            })

        } catch (err) {
            console.log(err)
            await sock.sendMessage(chat, { react: { text: '❌', key: m.key } })
            await sock.sendMessage(chat, { text: '❌ No pude expulsarlo, quizá no soy admin o es admin.' })
        }
    }
}