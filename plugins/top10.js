export default {
    comando: 'top',
    alias: ['top10'],
    category: 'fun',
    cooldown: 3,
    execute: async (sock, chat, m) => {
        if (!chat.endsWith('@g.us')) {
            await sock.sendMessage(chat, { react: { text: '❌', key: m.key } })
            return sock.sendMessage(chat, { text: '❌ Solo en grupos.' })
        }

        const texto = m.text.split(' ').slice(1).join(' ').trim()
        if (!texto) {
            await sock.sendMessage(chat, { react: { text: '❌', key: m.key } })
            return sock.sendMessage(chat, { text: '✏️ Escribe un texto. Ej: top guapos' })
        }

        try {
            const meta = await sock.groupMetadata(chat)
            let ps = meta.participants.map(v => v.id)

            if (!ps.length) return sock.sendMessage(chat, { text: '❌ No pude obtener participantes.' })

            const getRandom = () => ps[Math.floor(Math.random() * ps.length)]
            const pickRandom = (list) => list[Math.floor(Math.random() * list.length)]

            // evita repetidos
            let elegidos = []
            while (elegidos.length < 10) {
                let r = getRandom()
                if (!elegidos.includes(r)) elegidos.push(r)
            }

            const [a,b,c,d,e,f,g,h,i,j] = elegidos
            const emojis = ['🤓','😅','😂','😳','😎','🥵','😱','🤑','🙄','💩','🍑','🤨','🥴','🔥','👇🏻','😔','👀','🌚']
            let x = pickRandom(emojis)

            let top = `*${x} Top 10 ${texto} ${x}*\n\n`+
            `*1. @${a.split('@')[0]}*\n`+
            `*2. @${b.split('@')[0]}*\n`+
            `*3. @${c.split('@')[0]}*\n`+
            `*4. @${d.split('@')[0]}*\n`+
            `*5. @${e.split('@')[0]}*\n`+
            `*6. @${f.split('@')[0]}*\n`+
            `*7. @${g.split('@')[0]}*\n`+
            `*8. @${h.split('@')[0]}*\n`+
            `*9. @${i.split('@')[0]}*\n`+
            `*10. @${j.split('@')[0]}*`

            await sock.sendMessage(chat, { react: { text: '🔝', key: m.key } })
            await sock.sendMessage(chat, { 
                text: top, 
                mentions: elegidos 
            })

        } catch (err) {
            console.log(err)
            await sock.sendMessage(chat, { react: { text: '❌', key: m.key } })
            await sock.sendMessage(chat, { text: '❌ Error al hacer el top.' })
        }
    }
}