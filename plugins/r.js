import { exec as _exec } from 'child_process'
import { promisify } from 'util'

const exec = promisify(_exec)

export default {
    comando: 'r',
    alias: ['exec', 'ejecutar', 'terminal'],
    category: 'owner',

    execute: async (sock, chat, m, args, { isOwner, prefix, pushName, userNumber }) => {
        if (!isOwner) {
            return
        }

        const texto = args.join(' ')
        
        if (!texto) {
            await sock.sendMessage(chat, { 
                text: `📝 Uso: ${prefix}r <comando>\n\nEjemplo:\n${prefix}r ls -la\n${prefix}r pwd\n${prefix}r whoami`,
                react: { text: '📝', key: m.key } 
            }, { quoted: m })
            return
        }

        await sock.sendMessage(chat, { react: { text: '🕒', key: m.key } })

        try {
            const { stdout, stderr } = await exec(texto, { timeout: 30000 })
            
            await sock.sendMessage(chat, { react: { text: '✔️', key: m.key } })
            
            let res = stdout || stderr || '✅ Comando ejecutado sin salida'

            await sock.sendMessage(chat, { text: res }, { quoted: m })

            console.log(`✅ Exec ejecutado por OWNER: ${pushName || userNumber}`)
            console.log(`📝 Comando: ${texto}`)

        } catch (e) {
            await sock.sendMessage(chat, { react: { text: '✖️', key: m.key } })
            await sock.sendMessage(chat, { text: `❌ Error:\n${e.message}` }, { quoted: m })
            console.log(`❌ Error en exec: ${e.message}`)
        }
    }
}
