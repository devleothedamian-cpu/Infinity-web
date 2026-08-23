import os from 'os'
import process from 'process'

export default {
    comando: 'ping',
    alias: ['p', 'speed'],
    category: 'Info',

    execute: async (sock, chat, m, args, { config, botJid }) => {
        const start = Date.now()
        
        await sock.sendMessage(chat, { react: { text: '⭐', key: m.key } })
        
        const end = Date.now()
        const ping = end - start
        
        const ramUsada = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)
        const ramTotal = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2)
        const ramLibre = (os.freemem() / 1024 / 1024 / 1024).toFixed(2)
        
        const cpuUsage = os.loadavg()[0].toFixed(2)
        const cpuModel = os.cpus()[0].model
        const nodeVersion = process.version
        
        const texto = `\`✿\` ¡𝖯𝗈𝗇𝗀! 
> 𝖵𝖾𝗅𝗈𝖼𝗂𝖽𝖺𝖽: ${ping} ms
> 𝖱𝖺𝗆: ${ramUsada} MB / ${ramLibre} GB
> 𝖢𝗉𝗎: ${cpuUsage}%
> 𝖬𝗈𝖽𝖾𝗅𝗈: ${cpuModel}
> 𝖭𝗈𝖽𝖾𝗃𝗌: ${nodeVersion}`

        return sock.sendMessage(chat, { text: texto }, { quoted: m })
    }
}
