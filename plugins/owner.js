import fs from 'fs'
import path from 'path'

export default {
    comando: 'menu',
    alias: ['help', 'comandos', 'list', 'cmd'],
    category: 'info',
    execute: async (sock, chat, m) => {
        try {
            const nombreBot = global.nombreBot || 'INFINITY-BOT'
            const tipo = global.tipo || 'principal'
            const developer = global.developer || 'DEV LEO'
            const sender = m.sender || m.key?.participant || m.key?.remoteJid || 'user'
            const user = '@' + sender.split('@')[0]
            const prefijos = global.prefixes? global.prefixes.join(' ') : '.'
            const prefijo = global.prefixes? global.prefixes[0] : '.'

            const categorias = {}
            let totalCmds = 0
            const pluginsDir = './plugins'

            const carpetas = fs.readdirSync(pluginsDir)
            for (const carpeta of carpetas) {
                const rutaCarpeta = path.join(pluginsDir, carpeta)
                if (!fs.statSync(rutaCarpeta).isDirectory()) continue
                const archivos = fs.readdirSync(rutaCarpeta).filter(f => f.endsWith('.js'))
                for (const archivo of archivos) {
                    try {
                        const code = fs.readFileSync(path.join(rutaCarpeta, archivo), 'utf-8')
                        const matchCmd = code.match(/comando:\s*['"`](.*?)['"`]/)
                        const matchCat = code.match(/category:\s*['"`](.*?)['"`]/)
                        if(!matchCmd) continue
                        const cmd = matchCmd[1]
                        const catKey = (matchCat? matchCat[1] : carpeta).toLowerCase()
                        if(!categorias[catKey]) categorias[catKey] = { nombre: matchCat? matchCat[1] : carpeta, cmds: [] }
                        if(!categorias[catKey].cmds.includes(cmd)) {
                            categorias[catKey].cmds.push(cmd)
                            totalCmds++
                        }
                    } catch(e) {}
                }
            }

            let texto = `*✦━━━━━━━━━━✦*\n`
            texto += ` 🥷 *${nombreBot.toUpperCase()}* 🥷\n`
            texto += `*✦━━━━━━━━━━✦*\n\n`
            texto += `「 ${user} 」 ⚡\n\n`
            texto += `📋 *Soy ${nombreBot}, tu ayudante virtual con ${totalCmds} comandos*\n\n`
            texto += `*┏ ♣️ INFORMACIÓN ┓*\n`
            texto += `┃ *| 🥷 Developer:* ${developer}\n`
            texto += `┃ *| 🤖 Nombre:* ${nombreBot}\n`
            texto += `┃ *| ⚡ Tipo:* ${tipo}\n`
            texto += `┃ *| 🏷️ Versión:* 1.0.0\n`
            texto += `┃ *| 🟢 Estado:* Online\n`
            texto += `┃ *| 📝 Prefijos:* ${prefijos}\n`
            texto += `┃ *| 📊 Total Cmds:* ${totalCmds}\n`
            texto += `┃ *| ⚙️ Sistema:* Infinity club System\n`
            texto += `*┗━━━━━━━━━━┛*\n\n`
            texto += `✦━━━━━━━━━━✦\n`
            texto += `*Usa ${prefijo}code para vincular un sub-bot*\n`
            texto += `✦━━━━━━━━━━✦\n\n`

            Object.keys(categorias).sort().forEach(key => {
                const cat = categorias[key]
                texto += `┌── ❇️ *${cat.nombre.toUpperCase()}* [${cat.cmds.length}]\n`
                cat.cmds.sort().forEach(comando => {
                    texto += `│🌠 *${prefijo}${comando}*\n`
                })
                texto += `└────────\n\n`
            })

            texto += `*✦━━━━━━━━━━✦*\n`
            texto += `> Usa ${prefijo}buglist para ver comandos con error`

            await sock.sendMessage(chat, {
                text: texto,
                mentions: [sender],
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: global.canalID, // '120363...@newsletter'
                        newsletterName: global.nombreCanal || 'INFINITY CHANNEL',
                        serverMessageId: 1
                    }
                }
            })

        } catch(e) {
            await sock.sendMessage(chat, { text: `❌ ERROR: ${e.message}` })
        }
    }
}