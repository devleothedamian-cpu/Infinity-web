import fs from 'fs'
import path from 'path'

let intervalId = null

export default {
    comando: 'autods',
    alias: ['autoclean', 'autosession'],
    category: 'Owner',

    execute: async (sock, chat, m, args, { isOwner, isCreador, prefix, settings }) => {
        if (!isOwner && !isCreador) {
            await sock.sendMessage(chat, { react: { text: '❌', key: m.key } })
            return
        }

        const subcomando = args[0]?.toLowerCase()

        if (subcomando === 'on') {
            if (intervalId !== null) {
                await sock.sendMessage(chat, { 
                    text: '⚠️ Ya hay un autods en ejecución.',
                    react: { text: '⚠️', key: m.key } 
                }, { quoted: m })
                return
            }

            const tiempo = args[1] || '20m'
            let milisegundos = 0

            if (tiempo.endsWith('s')) {
                milisegundos = parseInt(tiempo) * 1000
            } else if (tiempo.endsWith('m')) {
                milisegundos = parseInt(tiempo) * 60 * 1000
            } else if (tiempo.endsWith('h')) {
                milisegundos = parseInt(tiempo) * 60 * 60 * 1000
            } else {
                milisegundos = parseInt(tiempo) * 60 * 1000
            }

            if (isNaN(milisegundos) || milisegundos < 5000) {
                await sock.sendMessage(chat, { 
                    text: `❌ Tiempo inválido. Usa: 5s, 5m, 5h`,
                    react: { text: '❌', key: m.key } 
                }, { quoted: m })
                return
            }

            intervalId = setInterval(async () => {
                try {
                    const authPath = path.join(process.cwd(), 'auth')
                    
                    if (!fs.existsSync(authPath)) {
                        return
                    }
                    
                    const files = fs.readdirSync(authPath)
                    let filesDeleted = 0
                    
                    for (const file of files) {
                        if (file !== 'creds.json') {
                            fs.unlinkSync(path.join(authPath, file))
                            filesDeleted++
                        }
                    }
                    
                    if (filesDeleted > 0) {
                        await sock.sendMessage(chat, { 
                            text: `⭐ Autods\n> Archivos limpiados: ${filesDeleted}`,
                            react: { text: '⭐', key: m.key } 
                        })
                    }
                } catch (e) {
                    console.log('Error en autods:', e.message)
                }
            }, milisegundos)

            const tiempoTexto = tiempo.endsWith('s') ? `${tiempo} segundos` : 
                               tiempo.endsWith('m') ? `${tiempo} minutos` : 
                               tiempo.endsWith('h') ? `${tiempo} horas` : `${tiempo} minutos`

            await sock.sendMessage(chat, { 
                text: `✅ Autods iniciado\n⏱️ Cada: ${tiempoTexto}\n📁 Limpiando archivos de sesión (excepto creds.json)`,
                react: { text: '✅', key: m.key } 
            }, { quoted: m })

        } else if (subcomando === 'stop') {
            if (intervalId === null) {
                await sock.sendMessage(chat, { 
                    text: '⚠️ No hay ningún autods en ejecución.',
                    react: { text: '⚠️', key: m.key } 
                }, { quoted: m })
                return
            }

            clearInterval(intervalId)
            intervalId = null

            await sock.sendMessage(chat, { 
                text: '✅ Autods detenido.',
                react: { text: '✅', key: m.key } 
            }, { quoted: m })

        } else {
            await sock.sendMessage(chat, { 
                text: `📝 Uso: ${prefix}autods <on|stop> [tiempo]\n\nEjemplos:\n${prefix}autods on 5s  (cada 5 segundos)\n${prefix}autods on 5m  (cada 5 minutos)\n${prefix}autods on 2h  (cada 2 horas)\n${prefix}autods on 20  (cada 20 minutos por defecto)\n${prefix}autods stop`,
                react: { text: '📝', key: m.key } 
            }, { quoted: m })
        }
    }
}
