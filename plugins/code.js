import settings from '../../settings.js'
import { iniciarSubbot, contarSubbotsDe, listarSubbots } from '../../lib/subbot.js'

export default {
    comando: 'code',
    alias: ['subbot', 'jadibot', 'serbot'],
    category: 'subbots',
    execute: async (sock, chat, m) => {
        try {
            const args = m.text.split(' ').slice(1)
            const senderJid = m.key.participant || m.sender
            const senderNum = m.sender.split('@')[0]
            const isOwner = settings.owner?.includes(senderNum)

            let numero = args[0]?.replace(/\D/g, '')
            if (!numero) numero = senderNum

            if (!numero || numero.length < 8) {
                return await sock.sendMessage(chat, {
                    text: `✳️ Uso: *${settings.prefijo}serbot 51987654321*\nSi no pones número, vincula tu número actual.`
                })
            }

            const activos = listarSubbots()
            const maxGlobal = settings.maxSubbots?? 10
            const maxPorUsuario = settings.subbotsPorUsuario?? 2

            if (activos.length >= maxGlobal &&!isOwner) {
                return await sock.sendMessage(chat, { text: `❌ Máximo de subbots alcanzado (${maxGlobal}).` })
            }

            if (!isOwner && contarSubbotsDe(senderJid) >= maxPorUsuario) {
                return await sock.sendMessage(chat, { text: `❌ Ya tienes ${maxPorUsuario} subbot(s). Usa *${settings.prefijo}delsubbot*` })
            }

            await sock.sendMessage(chat, { react: { text: '⏳', key: m.key } })
            await sock.sendMessage(chat, { text: `⏳ Generando código para +${numero}...\nTipo: Sub-Bot` })

            const caption = `🔑 *VINCULACIÓN SUB-BOT*\n\n📱 Número: +${numero}\n🤖 Tipo: Sub-Bot\n\n1. WhatsApp > Dispositivos vinculados\n2. Vincular con número de teléfono\n3. Pega el código`

            await iniciarSubbot({
                numero,
                creadorJid: senderJid,
                chatOrigen: chat,
                sockPrincipal: sock
            })

            // El código lo manda automáticamente lib/subbot.js
            await sock.sendMessage(chat, { react: { text: '✅', key: m.key } })

        } catch (e) {
            console.log(e)
            await sock.sendMessage(chat, { text: `❌ Error: ${e.message}` })
        }
    }
}