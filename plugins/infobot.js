import settings from '../../settings.js'

export default {
    comando: 'infobot',
    alias: ['info', 'botinfo', 'infob'],
    category: 'info',
    execute: async (sock, chat, m) => {
        try {
            // Prioridad: global (dinámico para subbots) -> settings (base)
            const nombreBot = global.nombreBot || settings.nombreBot || 'INFINITY-BOT'
            const tipo = global.tipo || settings.tipo || 'principal'
            const developer = global.developer || settings.developer || 'DEV LEO'
            const footer = global.footer || settings.footer || nombreBot
            const sender = m.sender || m.key?.participant || m.key?.remoteJid || 'user'
            
            const activos = global.conns?.length || 1

            let texto = `*˚₊ ༝𓊈INFO DEL BOT𓊉˚₊ ༝*\n`
            texto += `╭━━━━〔 🌟 〕━━━━⬣\n`
            texto += `┃*🌠 |+ ⌗⊹₊ bot » ${nombreBot}*\n`
            texto += `┃*🌀 |+ ⌗⊹₊ Tipo » ${tipo}*\n`
            texto += `┃*🥷 |+ ⌗⊹₊ Developer » ${developer}*\n`
            texto += `┃*🏷️ |+ ⌗⊹₊ footer » ${footer}*\n`
            texto += `┃*🪽 |+ ⌗⊹₊ Bots » ${activos} activos*\n`
            texto += `╰━━━━〔 🪽 〕━━━━`

            await sock.sendMessage(chat, {
                text: '×͜× 𝗜𝗻𝗳𝗼 𝗕𝗼𝘁',
                nativeFlowMessage: {
                    buttons: [],
                    messageParamsJson: JSON.stringify({
                        limited_time_offer: {
                            text: texto,
                            url: 'https://u.pone.rs/jjyqnnej.jpg',
                            copy_code: null,
                            expiration_time: null
                        }
                    })
                },
                mentions: [sender]
            })

        } catch(e) {
            await sock.sendMessage(chat, { text: `❌ ERROR: ${e.message}` })
        }
    }
}