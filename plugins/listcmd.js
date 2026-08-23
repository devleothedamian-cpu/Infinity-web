import fs from 'fs'
import path from 'path'

export default {
    comando: 'listcmd',
    alias: ['cmds', 'allcmd', 'comandos'],
    category: 'info',
    execute: async (sock, chat, m, args) => {
        const prefijo = global.prefixes[0]
        const pluginsDir = './plugins'
        let texto = `*𐂯 LISTA DE TODOS LOS COMANDOS*\n`
        texto += `*Total: contando...*\n\n`

        let total = 0
        const carpetas = fs.readdirSync(pluginsDir)

        for (const carpeta of carpetas) {
            const rutaCarpeta = path.join(pluginsDir, carpeta)
            if (!fs.statSync(rutaCarpeta).isDirectory()) continue

            const archivos = fs.readdirSync(rutaCarpeta).filter(f => f.endsWith('.js'))
            if(archivos.length === 0) continue

            texto += `* ⌗ ${carpeta.toUpperCase()}*\n`
            for (const archivo of archivos) {
                try {
                    const ruta = path.join(rutaCarpeta, archivo)
                    const code = fs.readFileSync(ruta, 'utf-8')

                    const matchCmd = code.match(/comando:\s*['"`](.*?)['"`]/)
                    const matchCat = code.match(/category:\s*['"`](.*?)['"`]/)

                    if(matchCmd) {
                        const cmd = matchCmd[1]
                        const cat = matchCat? matchCat[1] : 'Sin Cat'
                        texto += `• ${prefijo}${cmd} _[${cat}]_\n`
                        total++
                    }
                } catch(e) {}
            }
            texto += `\n`
        }

        texto += `*━━━━━━━━━━━━━━*\n`
        texto += `*Total de comandos: ${total}*`

        await sock.sendMessage(chat, { text: texto }, { quoted: m })
    }
}