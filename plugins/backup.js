import AdmZip from 'adm-zip'
import fs from 'fs'
import path from 'path'

export default {
    comando: 'backup',
    alias: ['respaldar', 'zip'],
    category: 'Owner',

    execute: async (sock, chat, m, args, { isOwner, isCreador, prefix, settings }) => {
        if (!isOwner && !isCreador) {
            await sock.sendMessage(chat, { react: { text: '❌', key: m.key } })
            return
        }

        // ARREGLO DEFINITIVO: agarramos el número limpio
        const ownerJid = m.key.participant || m.key.remoteJid 

        await sock.sendMessage(chat, { react: { text: '📦', key: m.key } })
        await sock.sendMessage(chat, { text: `📦 *CREANDO RESPALDO...*\n\nTe lo enviaré a tu privado cuando termine` }, { quoted: m })

        try {
            const zip = new AdmZip()
            const rootDir = process.cwd()
            const fecha = new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' }).replace(/[:/ ]/g, '-')
            const botName = settings.nombreBot || 'BOT'
            const zipName = `${botName}-BACKUP-${fecha}.zip`
            const outputPath = path.join(rootDir, zipName)

            const ignore = [
                'node_modules',
                'auth',
                'sessions',
                '.git',
                'tmp',
                'backup',
                '*.zip',
                'package-lock.json',
                zipName
            ]

            function addFiles(dir, basePath = '') {
                const files = fs.readdirSync(dir)
                for (const file of files) {
                    const filePath = path.join(dir, file)
                    const relativePath = basePath ? path.join(basePath, file) : file

                    if (ignore.some(i => {
                        if (i.includes('*')) {
                            const pattern = i.replace('*', '')
                            return file.includes(pattern) || relativePath.includes(pattern)
                        }
                        return relativePath === i || relativePath.startsWith(i + '/') || file === i
                    })) {
                        continue
                    }

                    const stat = fs.statSync(filePath)
                    if (stat.isDirectory()) {
                        addFiles(filePath, relativePath)
                    } else {
                        zip.addLocalFile(filePath, basePath)
                    }
                }
            }

            addFiles(rootDir)
            zip.writeZip(outputPath)

            const stats = fs.statSync(outputPath)
            const sizeMB = (stats.size / 1024 / 1024).toFixed(2)

            // ENVIAR AL PRIVADO - sin que se rompa
            await sock.sendMessage(ownerJid, { react: { text: '✅', key: m.key } })
            await sock.sendMessage(ownerJid, {
                document: fs.readFileSync(outputPath),
                mimetype: 'application/zip',
                fileName: zipName,
                caption: `╭━━━━━━━━━━━━━━╮
 *RESPALDO COMPLETO*
╰━━━━━━━━━━━━━━╯

🤖 *Bot:* ${botName}
👨‍💻 *Dev:* ${settings.developer || 'DEV'}
📅 *Fecha:* ${new Date().toLocaleString('es-AR')}
📁 *Tamaño:* ${sizeMB} MB`
            })

            await sock.sendMessage(chat, { text: `✅ *Listo* \n\nTe envié el respaldo a tu privado 📩` }, { quoted: m })
            fs.unlinkSync(outputPath)

        } catch(e) {
            console.log(e)
            await sock.sendMessage(chat, { react: { text: '❌', key: m.key } })
            return sock.sendMessage(chat, { text: `❌ Error al crear el respaldo: ${e.message}` }, { quoted: m })
        }
    }
}