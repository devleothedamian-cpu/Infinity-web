import fs from 'fs'
import path from 'path'

export default {
    comando: 'getcode',
    alias: ['getfile', 'getplug', 'ver'],
    category: 'Owner',

    execute: async (sock, chat, m, args, { isOwner, isCreador, prefix, settings }) => {
        if (!isOwner && !isCreador) {
            await sock.sendMessage(chat, { react: { text: '❌', key: m.key } })
            return
        }

        const texto = args.join(' ')
        
        if (!texto) {
            await sock.sendMessage(chat, { 
                text: `📝 Uso: ${prefix}getcode <ruta>\n\nEjemplo:\n${prefix}getcode index.js\n${prefix}getcode plugins/ping.js`,
                react: { text: '📝', key: m.key } 
            }, { quoted: m })
            return
        }

        const filePath = path.join(process.cwd(), texto)

        if (!fs.existsSync(filePath)) {
            await sock.sendMessage(chat, { 
                text: `❌ El archivo "${texto}" no existe.`,
                react: { text: '❌', key: m.key } 
            }, { quoted: m })
            return
        }

        try {
            const contenido = fs.readFileSync(filePath, 'utf8')
            const nombreArchivo = path.basename(texto)

            await sock.sendMessage(chat, { 
                text: `📄 *${texto}*\n\n\`\`\`${contenido}\`\`\``,
                react: { text: '📄', key: m.key } 
            }, { quoted: m })

        } catch (e) {
            await sock.sendMessage(chat, { 
                text: `❌ Error al leer el archivo: ${e.message}`,
                react: { text: '❌', key: m.key } 
            }, { quoted: m })
        }
    }
}
