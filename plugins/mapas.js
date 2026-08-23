export default {
    comando: 'mapas',
    alias: ['mapa', 'mappool'],
    category: 'freefire',
    cooldown: 1,
    group: true,
    execute: async (sock, chat, m) => {
        await sock.sendMessage(chat, { react: { text: '🗺️', key: m.key } })

        const pasos = [
            "🎲 Seleccionando mapa para el desafío...",
            "🧠 Analizando terreno...",
            "📡 Cargando coordenadas...",
            "✅ Mapa seleccionado:"
        ]

        const tempMsg = await sock.sendMessage(chat, { text: pasos[0] }, { quoted: m })

        for (let i = 1; i < pasos.length; i++) {
            await new Promise(r => setTimeout(r, 1500))
            await sock.sendMessage(chat, {
                text: pasos[i],
                edit: tempMsg.key
            })
        }

        // Lista de mapas - imágenes
        const mapas = [
            "https://raw.githubusercontent.com/JTxs00/uploads/main/1787197350468.jpeg",
            "https://raw.githubusercontent.com/JTxs00/uploads/main/1787197914642.jpeg",
            "https://raw.githubusercontent.com/JTxs00/uploads/main/1787198156170.jpeg",
            "https://raw.githubusercontent.com/JTxs00/uploads/main/1787198323683.jpeg",
            "https://raw.githubusercontent.com/JTxs00/uploads/main/1787198423899.jpeg"
        ]

        const elegido = mapas[Math.floor(Math.random() * mapas.length)]

        await sock.sendMessage(chat, {
            image: { url: elegido },
            caption: "🌍 *Mapa asignado para el desafío.*\nPrepárense estrategas, el terreno ya está listo."
        }, { quoted: m })
    }
}