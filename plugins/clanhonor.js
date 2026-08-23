import { getClan } from '../../lib/clanes.js'

export default {
    comando: 'clanhonor',
    alias: ['honorclan'],
    category: 'freefire',
    group: true,
    execute: async (sock, chat, m) => {
        const clan = getClan(chat)
        if(!clan) return sock.sendMessage(chat,{text:`❌ No hay clan.`})

        const unaSemana = Date.now() - (7*24*60*60*1000)
        const actividad = (clan.actividad||[]).filter(a => a.fecha >= unaSemana)

        if(!actividad.length) return sock.sendMessage(chat,{text:`📭 Nadie ha hecho chamba esta semana en *${clan.nombre}*`})

        // Contar por miembro
        const conteo = {}
        actividad.forEach(a => {
            conteo[a.jid] = conteo[a.jid] || { exp:0, trabajos:0 }
            conteo[a.jid].exp += a.exp
            conteo[a.jid].trabajos += 1
        })

        let texto = `╭─🏅 *HONOR SEMANAL - ${clan.nombre}* ─╮\n`
        texto += `│ Nivel: ${clan.nivel} | Exp: ${clan.exp}/${clan.nivel*1000}\n├───────────\n`

        const orden = Object.entries(conteo).sort((a,b)=>b[1].exp-a[1].exp)
        orden.forEach(([jid, data], i)=>{
            texto += `│ ${i==0?'👑':`#${i+1}`} @${jid.split('@')[0]} - ${data.trabajos} trabajos | ${data.exp} exp\n`
        })

        texto += `├───────────\n`
        const noTrabajaron = clan.miembros.filter(j =>!conteo[j])
        if(noTrabajaron.length){
            texto += `│ 😴 No trabajaron:\n`
            noTrabajaron.forEach(j => texto += `│ - @${j.split('@')[0]}\n`)
        } else {
            texto += `│ ✅ Todos trabajaron!\n`
        }
        texto += `╰─────────────────`

        await sock.sendMessage(chat,{text: texto, mentions: [...Object.keys(conteo),...noTrabajaron]})
    }
}