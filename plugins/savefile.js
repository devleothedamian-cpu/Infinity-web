import fs from 'fs'
import path from 'path'

export default {
    comando: 'savefile',
    alias: ['svfile', 'guardar'],
    category: 'Owner',

    execute: async (sock, chat, m, args, { isOwner, isCreador, prefix, settings }) => {
        if (!isOwner && !isCreador) {
            await sock.sendMessage(chat, { react: { text: '❌', key: m.key } })
            return
        }

        const texto = args.join(' ')
        
        if (!texto) {
            await sock.sendMessage(chat, { 
                text: `📝 Uso: ${prefix}savefile <ruta>\n\nEjemplo:\n${prefix}savefile index.js\n${prefix}savefile plugins/ping.js\n\nResponde al mensaje que contiene el código.`,
                react: { text: '📝', key: m.key } 
            }, { quoted: m })
            return
        }

        if (!m.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
            await sock.sendMessage(chat, { 
                text: `❌ Responde al mensaje que contiene el código.`,
                react: { text: '❌', key: m.key } 
            }, { quoted: m })
            return
        }

        const quotedMsg = m.message.extendedTextMessage.contextInfo.quotedMessage
        let codigo = quotedMsg.conversation || quotedMsg.extendedTextMessage?.text || ''

        if (!codigo) {
            await sock.sendMessage(chat, { 
                text: `❌ No se encontró código en el mensaje citado.`,
                react: { text: '❌', key: m.key } 
            }, { quoted: m })
            return
        }

        const filePath = path.join(process.cwd(), texto)

        try {
            const dir = path.dirname(filePath)
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true })
            }

            fs.writeFileSync(filePath, codigo)

            await sock.sendMessage(chat, { 
                text: `✅ Archivo guardado en: ${texto}`,
                react: { text: '✅', key: m.key } 
            }, { quoted: m })

        } catch (e) {
            await sock.sendMessage(chat, { 
                text: `❌ Error al guardar: ${e.message}`,
                react: { text: '❌', key: m.key } 
            }, { quoted: m })
        }
    }
}
