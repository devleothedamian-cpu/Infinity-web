export default {
    comando: '10vs10', alias: ['vs10'], category: 'freefire', cooldown: 5, group: true,
    execute: async (sock, chat, m) => {
        const horaTexto = m.text.split(' ').slice(1).join(' ').trim()
        if (!horaTexto) return sock.sendMessage(chat, { text: `✳️ Usa: *${m.prefix||'.'}10vs10 [hora]*` })
        const to24Hour = (str) => { let [time, mod] = str.toLowerCase().split(/(am|pm)/); let [h, mm] = time.split(":").map(n=>parseInt(n)); if(mod==='pm'&&h!==12)h+=12; if(mod==='am'&&h===12)h=0; return{h,m:mm||0} }
        const to12Hour = (h, m) => { const s=h>=12?'pm':'am'; h=h%12||12; return `${h}:${m.toString().padStart(2,'0')}${s}` }
        let base; try{base=to24Hour(horaTexto); if(isNaN(base.h)) throw 0}catch{return sock.sendMessage(chat,{text:"❌ Hora inválida."})}
        const zonas = [{pais:"🇲🇽 MÉXICO",offset:0},{pais:"🇨🇴 COLOMBIA",offset:1},{pais:"🇵🇪 PERÚ",offset:1},{pais:"🇵🇦 PANAMÁ",offset:1},{pais:"🇸🇻 EL SALVADOR",offset:0},{pais:"🇨🇱 CHILE",offset:2},{pais:"🇦🇷 ARGENTINA",offset:3},{pais:"🇪🇸 ESPAÑA",offset:8}]
        const horaMsg = zonas.map(z=>{let nh=base.h+z.offset; if(nh>=24)nh-=24; if(nh<0)nh+=24; return`${z.pais} : ${to12Hour(nh,base.m)}`}).join("\n")
        const meta = await sock.groupMetadata(chat)
        await sock.sendMessage(chat, { react: { text: '💥', key: m.key } })
        const participantes = meta.participants.filter(p=>p.id!==sock.user.id).sort(()=>Math.random()-0.5)
        if(participantes.length<22) return sock.sendMessage(chat,{text:"⚠️ Necesito al menos 22 usuarios."})
        const t1=participantes.slice(0,10), t2=participantes.slice(10,20), sup=participantes.slice(20,22)
        const render = a=>a.map((u,i)=>`${i===0?"👑":"🥷🏻"} ┇ @${u.id.split("@")[0]}`).join("\n")
        const txt = `*10 𝐕𝐄𝐑𝐒𝐔𝐒 10*\n\n⏱ 𝐇𝐎𝐑𝐀𝐑𝐈𝐎\n${horaMsg}\n\n 𝗘𝗦𝗖𝗨𝗔𝗗𝗥𝗔 1\n${render(t1)}\n\n 𝗘𝗦𝗖𝗨𝗔𝗗𝗥𝗔 2\n${render(t2)}\n\n ʚ 𝐒𝐔𝐏𝐋𝐄𝐍𝐓𝐄𝐒:\n${render(sup)}`
        await sock.sendMessage(chat,{text:txt,mentions:[...t1,...t2,...sup].map(p=>p.id)})
    }
}