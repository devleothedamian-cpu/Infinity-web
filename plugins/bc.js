export default {
    comando: 'bc',
    alias: ['broadcast', 'comunicado', 'anuncio', 'bcgc', 'bcgrupos'],
    category: 'owner',
    cooldown: 0,
    owner: true,
    execute: async (sock, chat, m) => {
        const texto = m.text.split(' ').slice(1).join(' ').trim() || m.quoted?.text

        if (!texto) {
            await sock.sendMessage(chat, { react: { text: '❌', key: m.key } })
            return sock.sendMessage(chat, { text: '🚩 Escribe el texto a enviar a grupos y comunidades.' })
        }

        const allGroups = Object.keys(await sock.groupFetchAllParticipating())
        const comunidades = allGroups.filter(jid => jid.endsWith('@g.us') || jid.endsWith('@lid')) // @lid = comunidades nuevas de WA

        if (!comunidades.length) {
            return sock.sendMessage(chat, { text: '❌ No estoy en ningún grupo/comunidad.' })
        }

        await sock.sendMessage(chat, { react: { text: '📢', key: m.key } })
        await sock.sendMessage(chat, { text: `📢 *Enviando a ${comunidades.length} grupos/comunidades...*\n\nNo cierres el bot.` })

        const start = Date.now()
        let enviados = 0
        let fallidos = 0

        for (let i = 0; i < comunidades.length; i++) {
            const id = comunidades[i]
            await new Promise(res => setTimeout(res, 2500)) // 2.5s delay para no ban
            try {
                await sock.sendMessage(id, { text: `📢 *COMUNICADO OFICIAL* 📢\n\n${texto}` })
                enviados++
            } catch (e) {
                fallidos++
            }
        }

        let time = Math.floor((Date.now() - start) / 1000)
        let timeTxt = time >= 60 ? `${Math.floor(time/60)}m ${time%60}s` : `${time}s`

        await sock.sendMessage(chat, {
            text: `✅ *Broadcast terminado*\n\n📤 Enviados: ${enviados}\n❌ Fallidos: ${fallidos}\n👥 Total: ${comunidades.length}\n⏱️ Tiempo: ${timeTxt}`
        })
    }
}