export default {
    comando: '3vs3',
    alias: ['vs3', 'escuadra3'],
    category: 'freefire',
    cooldown: 5,
    group: true,
    execute: async (sock, chat, m) => {
        const sender = m.sender
        const senderNum = sender.replace(/[^0-9]/g, "")
        const isOwner = global.owner?.some(([id]) => id === senderNum)
        const meta = await sock.groupMetadata(chat)
        const isAdmin = meta.participants.find(p => p.id === sender)?.admin
        if (!isAdmin &&!isOwner &&!m.fromMe) return sock.sendMessage(chat, { text: "❌ Solo *admins* o *owner*." })

        const horaTexto = m.text.split(' ').slice(1).join(' ').trim()
        if (!horaTexto) return sock.sendMessage(chat, { text: `✳️ Usa: *${m.prefix||'.'}3vs3 [hora]*\nEj: *${m.prefix||'.'}3vs3 6:30pm*` })

        const to24Hour = (str) => { let [time, mod] = str.toLowerCase().split(/(am|pm)/); let [h, mm] = time.split(":").map(n=>parseInt(n)); if(mod==='pm'&&h!==12)h+=12; if(mod==='am'&&h===12)h=0; return{h,m:mm||0} }
        const to12Hour = (h, m) => { const s=h>=12?'pm':'am'; h=h%12||12; return `${h}:${m.toString().padStart(2,'0')}${s}` }
        let base; try{base=to24Hour(horaTexto); if(isNaN(base.h)) throw 0}catch{return sock.sendMessage(chat,{text:"❌ Hora inválida."})}

        const zonas = [{pais:"🇲🇽 MÉXICO",offset:0},{pais:"🇨🇴 COLOMBIA",offset:0},{pais:"🇵🇪 PERÚ",offset:0},{pais:"🇵🇦 PANAMÁ",offset:0},{pais:"🇸🇻 EL SALVADOR",offset:0},{pais:"🇨🇱 CHILE",offset:2},{pais:"🇦🇷 ARGENTINA",offset:2},{pais:"🇪🇸 ESPAÑA",offset:7}]
        const horaMsg = zonas.map(z=>{let nh=base.h+z.offset; if(nh>=24)nh-=24; if(nh<0)nh+=24; return`${z.pais} : ${to12Hour(nh,base.m)}`}).join("\n")

        await sock.sendMessage(chat, { react: { text: '🎮', key: m.key } })
        const participantes = meta.participants.filter(p=>p.id!==sock.user.id)
        if(participantes.length<8) return sock.sendMessage(chat,{text:"⚠️ Necesito al menos 8 usuarios."})

        const tempMsg = await sock.sendMessage(chat, { text: "🎮 Preparando escuadras 3vs3..." })
        await new Promise(r=>setTimeout(r,1500))
        await sock.sendMessage(chat, { text: "🎯 Mezclando jugadores...", edit: tempMsg.key })

        const shuffled = participantes.sort(()=>Math.random()-0.5)
        const t1=shuffled.slice(0,3), t2=shuffled.slice(3,6), sup=shuffled.slice(6,8)
        const render = a=>a.map((u,i)=>`${i===0?"👑":"🥷🏻"} ┇ @${u.id.split("@")[0]}`).join("\n")

        const textoFinal = `*3 𝐕𝐄𝐑𝐒𝐔𝐒 3*\n\n⏱ 𝐇𝐎𝐑𝐀𝐑𝐈𝐎\n${horaMsg}\n\n➥ 𝐌𝐎𝐃𝐀𝐋𝐈𝐃𝐀𝐃: 🔫 Clásico\n\n 𝗘𝗦𝗖𝗨𝗔𝗗𝗥𝗔 1\n${render(t1)}\n\n 𝗘𝗦𝗖𝗨𝗔𝗗𝗥𝗔 2\n${render(t2)}\n\n ʚ 𝐒𝐔𝐏𝐋𝐄𝐍𝐓𝐄𝐒:\n${render(sup)}`
        await sock.sendMessage(chat,{text:textoFinal,mentions:[...t1,...t2,...sup].map(p=>p.id),edit:tempMsg.key})
    }
}