export default {
    comando: 'sorteo',
    alias: ['rifa', 'giveaway', 'ganador'],
    category: 'group',
    cooldown: 5,
    group: true,
    execute: async (sock, chat, m) => {
        const sender = m.sender
        const senderNum = sender.replace(/[^0-9]/g, "")
        const isOwner = global.owner?.some(([id]) => id === senderNum)

        const meta = await sock.groupMetadata(chat)
        const isAdmin = meta.participants.find(p => p.id === sender)?.admin

        if (!isAdmin &&!isOwner &&!m.fromMe) {
            return sock.sendMessage(chat, { text: "❌ Solo *admins* o *el dueño del bot* pueden usar este comando." })
        }

        const text = m.text.split(' ').slice(1).join(' ').trim()
        if (!text) {
            return sock.sendMessage(chat, { text: `✳️ Usa el comando así:\n\n*.sorteo [premio o motivo]*\nEjemplo:\n*.sorteo Carro Fino*` })
        }

        await sock.sendMessage(chat, { react: { text: '🎲', key: m.key } })

        const participantes = meta.participants.filter(p =>!p.admin && p.id!== sock.user.id)

        if (participantes.length === 0) {
            return sock.sendMessage(chat, { text: "⚠️ No hay suficientes participantes para hacer el sorteo." })
        }

        const ganador = participantes[Math.floor(Math.random() * participantes.length)].id

        const pasos = [
            "🎁 Preparando el sorteo...",
            "🎰 Revolviendo nombres...",
            "🌀 Cargando suerte...",
            "🎯 Apuntando al ganador..."
        ]

        const tempMsg = await sock.sendMessage(chat, { text: pasos[0] }, { quoted: m })

        for (let i = 1; i < pasos.length; i++) {
            await new Promise(r => setTimeout(r, 1500))
            await sock.sendMessage(chat, { text: pasos[i], edit: tempMsg.key })
        }

        await new Promise(r => setTimeout(r, 1500))
        await sock.sendMessage(chat, {
            text: `🎉 *SORTEO REALIZADO*\n\n🏆 *Premio:* ${text}\n👑 *Ganador:* @${ganador.split("@")[0]}`,
            mentions: [ganador],
            edit: tempMsg.key
        })
    }
}