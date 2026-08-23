export default {
    comando: 'delete',
    alias: ['del', 'borrar', 'd'],
    category: 'group',
    cooldown: 2,
    group: true,
    execute: async (sock, chat, m) => {
        const senderId = m.sender
        const senderClean = senderId.replace(/[^0-9]/g, "")
        const isOwner = global.owner?.some(([id]) => id === senderClean)

        const metadata = await sock.groupMetadata(chat)
        const participante = metadata.participants.find(p => p.id === senderId)
        const isAdmin = participante?.admin === "admin" || participante?.admin === "superadmin"

        if (!isAdmin &&!isOwner &&!m.fromMe) {
            await sock.sendMessage(chat, { react: { text: '❌', key: m.key } })
            return sock.sendMessage(chat, { text: "🚫 Solo los *admins* o el *owner* pueden usar este comando." })
        }

        const context = m.message?.extendedTextMessage?.contextInfo

        if (!context?.stanzaId ||!context?.participant) {
            return sock.sendMessage(chat, { text: "⚠️ Responde a un mensaje para eliminarlo con *.delete*" })
        }

        try {
            await sock.sendMessage(chat, {
                delete: {
                    remoteJid: chat,
                    fromMe: false,
                    id: context.stanzaId,
                    participant: context.participant
                }
            })

            await sock.sendMessage(chat, { react: { text: "✅", key: m.key } })

        } catch (e) {
            console.error("❌ Error eliminando:", e)
            await sock.sendMessage(chat, { text: "❌ No pude borrarlo. Asegúrate que el bot sea admin." })
        }
    }
}