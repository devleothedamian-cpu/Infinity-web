import axios from 'axios'

export default {
    comando: 'apk',
    alias: ['playstore', 'apkdl'],
    category: 'descargas',
    cooldown: 10,
    group: true,
    execute: async (sock, chat, m) => {
        const query = m.text.split(' ').slice(1).join(' ').trim()
        if (!query) return sock.sendMessage(chat, { text: `✳️ Usa: *${m.prefix||'.'}apk [nombre o id]*\nEj: *${m.prefix||'.'}apk US Army Train Zombie Shooting*` })

        await sock.sendMessage(chat, { react: { text: '📦', key: m.key } })
        const waiting = await sock.sendMessage(chat, { text: `🔍 Buscando *${query}*...` })

        try {
            const search = await axios.get(`https://api.davidcyriltech.my.id/search/apk?text=${encodeURIComponent(query)}`)
            const data = search.data?.result?.[0] || search.data?.[0]
            if (!data) throw new Error("No encontrado")

            const appId = data.id || query
            const dl = await axios.get(`https://api.davidcyriltech.my.id/apk/download?id=${appId}`)
            const app = dl.data?.result || dl.data

            // AQUI VA TU FOOTER DE settings.js
            const footer = global.footer || global.mensajes?.footer || '© 2026 INFINITY-BOT'

            const caption = `📱 *Nombre:* ${app.name || data.name}
𖠁 *Tamaño:* ${app.size || data.size || '77.6MB'}
𖠁 *Rating:* ${app.rating || '3.5'}
𖠁 *Instalaciones:* ${app.installs || '50,000+'}
𖠁 *Desarrollador:* ${app.developer || data.developer || 'Torque Gamers'}
𖠁 *Categoría:* ${app.category || 'Action'}
𖠁 *Versión:* ${app.version || '1.3'}
𖠁 *ID:* ${app.id || appId}

────────────
🤖 ${footer}
👨‍💻 ${global.developer} | ${global.nombreBot}`

            await sock.sendMessage(chat, { text: caption, edit: waiting.key })

            if (app.download_url || app.link) {
                await sock.sendMessage(chat, {
                    document: { url: app.download_url || app.link },
                    mimetype: 'application/vnd.android.package-archive',
                    fileName: `${app.name || 'app'}.apk`,
                    caption: `✅ *${app.name}* listo\n\n${footer}`
                })
            } else {
                 await sock.sendMessage(chat, { text: `⚠️ Link directo no disponible:\nhttps://play.google.com/store/apps/details?id=${appId}\n\n${footer}` })
            }

        } catch (e) {
            console.log(e)
            await sock.sendMessage(chat, { text: `❌ No encontré resultados para *${query}*`, edit: waiting.key })
        }
    }
}