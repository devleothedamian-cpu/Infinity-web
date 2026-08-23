export default {
    comando: '1vs1',
    alias: ['vs1', 'duelo', 'pvp1'],
    category: 'freefire',
    cooldown: 5,
    group: true,
    execute: async (sock, chat, m) => {
        const horaTexto = m.text.split(' ').slice(1).join(' ').trim()
        if (!horaTexto) return sock.sendMessage(chat, { text: `✳️ Usa: *${m.prefix||'.'}1vs1 [hora]*\nEj: *${m.prefix||'.'}1vs1 6:30pm*` })

        const to24Hour = (str) => { let [time, mod] = str.toLowerCase().split(/(am|pm)/); let [h, mm] = time.split(":").map(n=>parseInt(n)); if(mod==='pm'&&h!==12)h+=12; if(mod==='am'&&h===12)h=0; return{h,m:mm||0} }
        const to12Hour = (h, m) => { const s=h>=12?'pm':'am'; h=h%12||12; return `${h}:${m.toString().padStart(2,'0')}${s}` }
        let base; try{base=to24Hour(horaTexto); if(isNaN(base.h)) throw 0}catch{return sock.sendMessage(chat,{text:"❌ Hora inválida."})}

        const zonas = [
            { pais: "🇲🇽 MÉXICO", offset: 0 },
            { pais: "🇨🇴 COLOMBIA", offset: 1 },
            { pais: "🇵🇪 PERÚ", offset: 1 },
            { pais: "🇵🇦 PANAMÁ", offset: 1 },
            { pais: "🇸🇻 EL SALVADOR", offset: 0 },
            { pais: "🇨🇱 CHILE", offset: 2 },
            { pais: "🇦🇷 ARGENTINA", offset: 3 },
            { pais: "🇪🇸 ESPAÑA", offset: 8 }
        ]
        const horaMsg = zonas.map(z=>{let nh=base.h+z.offset; if(nh>=24)nh-=24; if(nh<0)nh+=24; return`${z.pais} : ${to12Hour(nh,base.m)}`}).join("\n")

        const meta = await sock.groupMetadata(chat)
        await sock.sendMessage(chat, { react: { text: '⚔️', key: m.key } })
        const participantes = meta.participants.filter(p=>p.id!==sock.user.id)
        if(participantes.length<2) return sock.sendMessage(chat,{text:"⚠️ Necesito al menos 2 usuarios."})

        const tempMsg = await sock.sendMessage(chat, { text: "⚔️ Buscando duelistas..." })
        await new Promise(r=>setTimeout(r,1500))
        await sock.sendMessage(chat, { text: "🎯 Seleccionando oponentes...", edit: tempMsg.key })

        const shuffled = participantes.sort(()=>Math.random()-0.5)
        const p1=shuffled[0], p2=shuffled[1]
        const textoFinal = `*⚔️ 1 𝐕𝐄𝐑𝐒𝐔𝐒 1 ⚔️*\n\n⏱ 𝐇𝐎𝐑𝐀𝐑𝐈𝐎\n${horaMsg}\n\n➥ 𝐌𝐎𝐃𝐀𝐋𝐈𝐃𝐀𝐃: 🔫 Clásico\n➥ 𝐃𝐔𝐄𝐋𝐎:\n\n👑 ┇ @${p1.id.split("@")[0]}\n 🆚\n🥷🏻 ┇ @${p2.id.split("@")[0]}`
        await sock.sendMessage(chat,{text:textoFinal,mentions:[p1.id,p2.id],edit:tempMsg.key})
    }
}