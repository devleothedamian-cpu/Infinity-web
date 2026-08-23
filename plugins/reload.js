import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default {
    comando: 'reload',
    alias: ['recargar', 'restart'],
    category: 'owner',

    execute: async (sock, chat, m, args, { isOwner, isCreador, prefix, settings }) => {
        if (!isOwner && !isCreador) {
            await sock.sendMessage(chat, { react: { text: '❌', key: m.key } })
            return
        }

        await sock.sendMessage(chat, { react: { text: '🔁', key: m.key } })
        await sock.sendMessage(chat, { text: '🔄 Recargando plugins...' }, { quoted: m })

        try {
            const pluginsPath = path.join(process.cwd(), 'plugins')
            
            function getAllJSFiles(dir) {
                let results = []
                if(!fs.existsSync(dir)) return results
                const list = fs.readdirSync(dir)
                for(const file of list) {
                    const filePath = path.join(dir, file)
                    const stat = fs.statSync(filePath)
                    if(stat && stat.isDirectory()) {
                        results = results.concat(getAllJSFiles(filePath))
                    } else if(file.endsWith('.js')) {
                        results.push(filePath)
                    }
                }
                return results
            }

            const files = getAllJSFiles(pluginsPath)
            let loadedCount = 0
            let errors = []

            for(const file of files) {
                try {
                    const pluginPath = pathToFileURL(file).href
                    const plugin = await import(pluginPath + `?v=${Date.now()}`)
                    const fileName = path.basename(file)
                    if(plugin.default && plugin.default.comando) {
                        console.log(`⭐ ${fileName} recargado con exito`)
                        loadedCount++
                    }
                } catch(e) {
                    const fileName = path.basename(file)
                    errors.push(`${fileName}: ${e.message}`)
                    console.log(`❌ Error recargando ${fileName}:`, e.message)
                }
            }

            let mensaje = `✅ Plugins recargados\n📦 Total: ${loadedCount} comandos`
            if (errors.length > 0) {
                mensaje += `\n\n❌ Errores:\n${errors.join('\n')}`
            }

            await sock.sendMessage(chat, { 
                text: mensaje,
                react: { text: '✅', key: m.key } 
            }, { quoted: m })

        } catch (error) {
            console.error('Error al recargar plugins:', error)
            await sock.sendMessage(chat, { 
                text: `❌ Error al recargar plugins:\n${error.message}`,
                react: { text: '❌', key: m.key } 
            }, { quoted: m })
        }
    }
}