import yts from 'yt-search'
import settings from '../../settings.js'

global.waitPlay = global.waitPlay || {}

// ===== PON TUS APIS Y KEYS AQUÍ =====
const APIS = [
  { base: "https://api.lempi.lat", key: "lem954", audio: "/dl/yta", video: "/dl/ytv" },
  { base: "https://api.lempi.lat", key: "TU_SEGUNDA_KEY", audio: "/dl/yta", video: "/dl/ytv" },
  { base: "https://api-sky.ultraplus.click", key: "Russellxz", audio: "/youtube/resolve", video: "/youtube/resolve" },
]

async function getDownloadUrl(videoUrl, tipo) {
  let lastError
  for (const api of APIS) {
    try {
      console.log(`[play] Probando: ${api.base} | key: ${api.key}`)
      let apiUrl = ""

      // API tipo lempi.lat
      if (api.base.includes("lempi.lat")) {
        apiUrl = tipo === "audio"
         ? `${api.base}${api.audio}?url=${encodeURIComponent(videoUrl)}&apikey=${api.key}`
          : `${api.base}${api.video}?url=${encodeURIComponent(videoUrl)}&apikey=${api.key}`

        const res = await fetch(apiUrl)
        const json = await res.json()
        if (!json.status ||!json.datos?.url) throw new Error("API lempi sin link")
        return { tourl: json.datos.url, titulo: json.titulo || json.datos.title || "audio" }
      }
      // API tipo sky ultraplus (usa POST)
      else {
        const isAudio = tipo === "audio"
        const body = isAudio
         ? { url: videoUrl, type: "audio", format: "mp3" }
          : { url: videoUrl, type: "video", quality: "360" }

        const res = await fetch(`${api.base}${api.audio}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "apikey": api.key },
          body: JSON.stringify(body)
        })
        const json = await res.json()
        const result = json.result || json.data || json
        const media = result?.media
        const url = media?.direct || media?.dl_download || media?.url || result?.url
        if (!url) throw new Error("API sky sin link")
        const finalUrl = url.startsWith("/")? api.base + url : url
        return { tourl: finalUrl, titulo: result.title || "video" }
      }

    } catch (e) {
      lastError = e
      console.log(`[play] Falló ${api.base}: ${e.message}`)
      continue
    }
  }
  throw lastError || new Error("Todas las APIs fallaron")
}

export default {
    comando: 'play',
    alias: ['play_audio_', 'play_video_', 'play_vdoc_', 'play_adoc_'],
    category: 'Descargas',
    execute: async (sock, chat, m, args, extra) => {
        const prefix = extra?.prefix || settings.prefijo
        const command = extra?.command || m.command || ''

        try {
            // === PARTE 1: TOCARON BOTON ===
            if (command.startsWith('play_audio_') || command.startsWith('play_video_') || command.startsWith('play_vdoc_') || command.startsWith('play_adoc_')) {
                const key = command.split('_').slice(2).join('_')
                const data = global.waitPlay[key]
                if (!data) return sock.sendMessage(chat, { text: '❌ Datos expiraron. Usa play de nuevo.' })

                await sock.sendMessage(chat, { react: { text: '⏳', key: m.key } })

                let tipo = 'audio'
                if (command.startsWith('play_video_') || command.startsWith('play_vdoc_')) tipo = 'video'

                await sock.sendMessage(chat, { text: `📥 *Descargando:* ${data.title}` }, { quoted: m })

                // --- TOUR DE APIS CON KEYS ---
                const { tourl, titulo } = await getDownloadUrl(data.url, tipo)

                const fileRes = await fetch(tourl, { headers: { 'User-Agent': 'Mozilla/5.0' } })
                const buffer = Buffer.from(await fileRes.arrayBuffer())

                if (command.startsWith('play_audio_')) {
                    await sock.sendMessage(chat, { audio: buffer, mimetype: 'audio/mpeg', fileName: `${titulo}.mp3` }, { quoted: m })
                } else if (command.startsWith('play_video_')) {
                    await sock.sendMessage(chat, { video: buffer, caption: `*${titulo}*` }, { quoted: m })
                } else if (command.startsWith('play_adoc_')) {
                    await sock.sendMessage(chat, { document: buffer, mimetype: 'audio/mpeg', fileName: `${titulo}.mp3` }, { quoted: m })
                } else if (command.startsWith('play_vdoc_')) {
                    await sock.sendMessage(chat, { document: buffer, mimetype: 'video/mp4', fileName: `${titulo}.mp4` }, { quoted: m })
                }

                await sock.sendMessage(chat, { react: { text: '✅', key: m.key } })
                delete global.waitPlay[key]
                return
            }

            // === PARTE 2: PLAY NORMAL ===
            if (!args ||!args[0]) return sock.sendMessage(chat, { text: `✳️ Uso: ${prefix}play [nombre]\nEj: ${prefix}play bad bunny diles` })

            await sock.sendMessage(chat, { react: { text: '🔍', key: m.key } })
            const search = await yts(args.join(' '))
            const video = search.videos[0]
            if (!video) throw new Error('No se encontró')

            const key = m.key.id
            global.waitPlay[key] = { url: video.url, title: video.title }
            setTimeout(() => delete global.waitPlay[key], 120000)

            await sock.sendMessage(chat, {
                image: { url: video.thumbnail },
                caption: `╭━━━━━━━━━━╮\n*🎬 RESULTADO*\n╰━━━━━━━━━━╯\n\n🚀 *Título:* ${video.title}\n♣️ *Canal:* ${video.author.name}\n⌛ *Duración:* ${video.timestamp}\n👁️ *Vistas:* ${video.views.toLocaleString()}\n\n> Elige formato abajo 👇`,
                footer: 'INFINITY-BOT',
                interactiveButtons: [
                    { name: "single_select", buttonParamsJson: JSON.stringify({
                        title: "🎵 Selecciona formato",
                        sections: [{ title: "Formatos", rows: [
                            { header: "🎵 Audio MP3", title: "Descargar Audio", id: `play_audio_${key}` },
                            { header: "🎥 Video MP4", title: "Descargar Video", id: `play_video_${key}` },
                            { header: "📁 Video Documento", title: "Video Doc", id: `play_vdoc_${key}` },
                            { header: "🔈 Audio Documento", title: "Audio Doc", id: `play_adoc_${key}` }
                        ]}]
                    })}
                ]
            })

        } catch (e) {
            console.log(e)
            await sock.sendMessage(chat, { text: `❌ Error: ${e.message}` }, { quoted: m })
            await sock.sendMessage(chat, { react: { text: '❌', key: m.key } })
        }
    }
}