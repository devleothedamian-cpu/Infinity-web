import axios from 'axios';

export default {
    comando: 'pareja',
    alias: ['parejas', 'ship', 'love'],
    category: 'fun',
    cooldown: 5,
    group: true,
    execute: async (sock, chat, m) => {
        try {
            await sock.sendMessage(chat, { react: { text: '💞', key: m.key } })

            const metadata = await sock.groupMetadata(chat)
            let participants = metadata.participants.map(p => p.id).filter(id => id!== sock.user.id)

            if (participants.length < 2) {
                return sock.sendMessage(chat, { text: "⚠️ *Se necesitan al menos 2 personas para formar parejas.*" })
            }

            participants = participants.sort(() => Math.random() - 0.5)

            const parejas = []
            const max = Math.min(5, Math.floor(participants.length / 2))
            for (let i = 0; i < max; i++) {
                parejas.push([participants.pop(), participants.pop()])
            }

            const solo = participants.length === 1? participants[0] : null

            const frases = [
                "🌹 *Un amor destinado...*",
                "💞 *¡Esta pareja tiene química!*",
                "❤️ *¡Qué hermosos juntos!*",
                "💕 *Cupido hizo su trabajo...*",
                "💑 *Parece que el destino los unió.*"
            ]

            let mensaje = `💖 *Parejas del Grupo* 💖\n\n`
            parejas.forEach((par, i) => {
                mensaje += `💍 *Pareja ${i + 1}:* @${par[0].split("@")[0]} 💕 @${par[1].split("@")[0]}\n`
                mensaje += `📜 ${frases[Math.floor(Math.random() * frases.length)]}\n\n`
            })

            if (solo) {
                mensaje += `😢 *@${solo.split("@")[0]} se quedó sin pareja...* 💔\n`
            }

            mensaje += `\n🌟 *¿Será el inicio de una gran historia de amor?*`

            let imageBuffer = null
            try {
                const response = await axios.get("https://cdn.russellxz.click/5886d88b.jpg", { responseType: "arraybuffer" })
                imageBuffer = Buffer.from(response.data)
            } catch (e) {
                console.error("❌ Error imagen pareja:", e)
            }

            const mentionList = parejas.flat().concat(solo? [solo] : [])

            if (imageBuffer) {
                await sock.sendMessage(chat, {
                    image: imageBuffer,
                    caption: mensaje,
                    mentions: mentionList
                }, { quoted: m })
            } else {
                await sock.sendMessage(chat, {
                    text: mensaje,
                    mentions: mentionList
                }, { quoted: m })
            }

            await sock.sendMessage(chat, { react: { text: "✅", key: m.key } })

        } catch (err) {
            console.error("❌ Error en pareja:", err)
            await sock.sendMessage(chat, { text: "❌ *Ocurrió un error al formar parejas.*" })
            await sock.sendMessage(chat, { react: { text: "❌", key: m.key } })
        }
    }
}