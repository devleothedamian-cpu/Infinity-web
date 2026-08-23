import fs from 'fs'
import '../../settings.js' 

const DB_PATH = './database/clanes.json'
const save = d => fs.writeFileSync(DB_PATH, JSON.stringify(d,null,2))

export default {
    comando: 'subirclan',
    alias: ['levelupclan', 'addnivelclan'],
    category: 'owner',
    group: false,
    execute: async (sock, chat, m) => {
        // Check owner desde settings.js
        const senderNum = m.sender.split('@')[0]
        const isOwner = global.owner.map(n => n.replace(/[^0-9]/g,'')).includes(senderNum)

        if(!isOwner){
            return sock.sendMessage(chat,{ text: global.mensajes.sinPermiso })
        }

        const args = m.text.split(' ').slice(1)
        if(args.length < 2){
            return sock.sendMessage(chat,{
                text: `✳️ Uso owner: *.subirclan [nombre clan] [niveles]*\nEj: *.subirclan LOS TOXICOS 10*`
            })
        }

        const niveles = parseInt(args[args.length - 1])
        const nombreClan = args.slice(0, -1).join(' ').trim()

        if(isNaN(niveles)){
            return sock.sendMessage(chat,{text:`❌ El último valor debe ser número.`})
        }

        if(!fs.existsSync(DB_PATH)) return sock.sendMessage(chat,{text:`❌ No hay DB de clanes`})

        const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'))
        const clanId = Object.keys(db).find(id => db[id].nombre.toLowerCase() === nombreClan.toLowerCase())

        if(!clanId){
            return sock.sendMessage(chat,{text:`❌ No encontré el clan *${nombreClan}*`})
        }

        const antes = db[clanId].nivel || 1
        db[clanId].nivel = antes + niveles
        db[clanId].exp = 0

        save(db)

        const texto = `╭─────>⋆☽⋆👑⋆☾⋆<─────╮
   ⬆️ 𝘾𝙇𝘼𝙉 𝙎𝙐𝘽𝙄𝘿𝙊 (OWNER)
╰─────>⋆☽⋆👑⋆☾⋆<─────╯
⸙ Nombre: *${db[clanId].nombre}*
⸙ Nivel anterior: ${antes}
⸙ Nivel nuevo: ${db[clanId].nivel}
⸙ +${niveles} niveles
⸙ Owner: @${senderNum}`

        await sock.sendMessage(chat,{text: texto, mentions:[m.sender]})
    }
}