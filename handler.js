import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import chalk from 'chalk'
import { jidDecode } from 'infinity'
import './settings.js'
import { getUser, addExp, updateUser } from './lib/db.js'

const settings = global
const { nombreBot, owner, prefixes, mensajes } = settings

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

global.avisosLink = global.avisosLink || {}
global.waitPlay = global.waitPlay || {}

global.antiLink = global.antiLink || {}
global.activos = global.activos || {}
global.socketAsignado = global.socketAsignado || {}
global.botsDesactivados = global.botsDesactivados || {}
global.baneados = global.baneados || {}
global.banUser = global.banUser || {}
global.restringidos = global.restringidos || {}
global.bienvenida = global.bienvenida || {}
global.despedida = global.despedida || {}

const BAN_FILE = './baneados.json'
const loadBan = () => {
    if(fs.existsSync(BAN_FILE)) {
        const data = JSON.parse(fs.readFileSync(BAN_FILE))
        global.baneados = data.baneados || {}
        global.banUser = data.banUser || {}
        global.restringidos = data.restringidos || {}
        global.bienvenida = data.bienvenida || {}
        global.despedida = data.despedida || {}
        global.antiLink = data.antiLink || {}
    }
}
const saveBan = () => fs.writeFileSync(BAN_FILE, JSON.stringify({
    baneados: global.baneados,
    banUser: global.banUser,
    restringidos: global.restringidos,
    bienvenida: global.bienvenida,
    despedida: global.despedida,
    antiLink: global.antiLink
}, null, 2))
loadBan()

const lidCache = new Map()
const lidNegativeCache = new Map()

function normalizeJid(raw) {
    if (!raw) return null
    const s = typeof raw === 'number' ? String(raw) : String(raw).trim()
    if (!s) return null
    if (s.endsWith('@g.us')) return s
    if (s.endsWith('@newsletter')) return s
    if (s.endsWith('@lid')) return s
    if (/:\d+@/i.test(s)) {
        const decoded = jidDecode(s)
        if (decoded?.user && decoded?.server) return `${decoded.user}@${decoded.server}`
    }
    if (s.endsWith('@s.whatsapp.net')) return s
    const digits = s.replace(/\D/g, '')
    if (digits && digits.length >= 4 && digits.length <= 15) return `${digits}@s.whatsapp.net`
    return s
}

function cleanNumber(number) {
    if (!number) return 'Desconocido'
    return number.split('@')[0].split(':')[0]
}

function hasLidStore(sock) {
    const lm = sock?.signalRepository?.lidMapping
    return typeof lm?.getPNsForLIDs === 'function' || typeof lm?.getPNForLID === 'function'
}

function withTimeout(promise, ms) {
    return new Promise((resolve) => {
        let done = false
        const timer = setTimeout(() => { if (!done) { done = true; resolve(null) } }, ms)
        Promise.resolve(promise).then(
            (v) => { if (!done) { done = true; clearTimeout(timer); resolve(v) } },
            () => { if (!done) { done = true; clearTimeout(timer); resolve(null) } }
        )
    })
}

async function resolveLidsAsync(lids, sock) {
    const list = [...new Set((lids ?? []).filter(l => l?.endsWith('@lid')))]
    const result = new Map()
    if (!list.length) return result
    const resolvedSet = new Set()
    const pending = list.filter(l => !lidNegativeCache.has(l))
    if (!pending.length || !hasLidStore(sock)) return result
    const lm = sock?.signalRepository?.lidMapping
    if (!lm) return result
    if (typeof lm.getPNsForLIDs === 'function') {
        let pairs = null
        try { pairs = await withTimeout(lm.getPNsForLIDs(pending), 2000) }
        catch { pairs = null }
        if (Array.isArray(pairs)) {
            for (const pair of pairs) {
                const n = normalizeJid(pair?.pn)
                if (pair?.lid && n && !n.endsWith('@lid')) {
                    lidCache.set(pair.lid, n)
                    result.set(pair.lid, n)
                    resolvedSet.add(pair.lid)
                }
            }
        }
    } else if (typeof lm.getPNForLID === 'function') {
        await Promise.all(pending.map(async (lid) => {
            let pn = null
            try { pn = await withTimeout(lm.getPNForLID(lid), 2000) }
            catch { pn = null }
            const n = normalizeJid(pn)
            if (n && !n.endsWith('@lid')) {
                lidCache.set(lid, n)
                result.set(lid, n)
                resolvedSet.add(lid)
            }
        }))
    }
    for (const l of pending) if (!resolvedSet.has(l)) lidNegativeCache.set(l, true)
    return result
}

async function resolveJidAsync(raw, sock, groupJid) {
    if (!raw) return null
    const norm = normalizeJid(raw)
    if (!norm) return null
    if (!norm.endsWith('@lid')) return norm
    
    if (lidCache.has(norm)) return lidCache.get(norm)
    
    const viaStore = await resolveLidsAsync([norm], sock)
    if (viaStore.get(norm)) return viaStore.get(norm)
    
    if (!groupJid?.endsWith('@g.us')) {
        try {
            const results = await withTimeout(sock.onWhatsApp(norm), 4000)
            const hit = Array.isArray(results) ? results.find(r => r?.exists) || results[0] : null
            const resolvedJid = hit?.jid ? normalizeJid(hit.jid) : null
            if (resolvedJid && !resolvedJid.endsWith('@lid')) {
                lidCache.set(norm, resolvedJid)
                return resolvedJid
            }
        } catch {}
        return norm
    }
    
    return norm
}

async function resolveSender(msg, sock) {
    const isGroup = msg.key.remoteJid?.endsWith('@g.us') ?? false
    let sender
    
    if (isGroup) {
        const rawSender = msg.key.participant || msg.key.remoteJid
        const resolved = await resolveJidAsync(rawSender, sock, msg.key.remoteJid)
        sender = resolved || rawSender
    } else {
        const rawSender = msg.key.remoteJid
        const resolved = await resolveJidAsync(rawSender, sock, null)
        sender = resolved || rawSender
    }
    
    return sender
}

export default async function handler(sock, m, pluginsMeta) {
    try {
        const msg = m.messages[0]
        if(!msg || !msg.message) return
        
        if(msg.key && msg.key.fromMe) return
        
        const chat = msg.key.remoteJid
        if(!chat) return
        
        const sender = await resolveSender(msg, sock)
        const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net'
        const senderNumber = cleanNumber(sender)
        const pushName = msg.pushName || 'Usuario'
        
        let texto = ''
        if(msg.message.conversation) {
            texto = msg.message.conversation
        } else if(msg.message.extendedTextMessage?.text) {
            texto = msg.message.extendedTextMessage.text
        } else if(msg.message.imageMessage?.caption) {
            texto = msg.message.imageMessage.caption
        } else if(msg.message.videoMessage?.caption) {
            texto = msg.message.videoMessage.caption
        } else if(msg.message.documentMessage?.caption) {
            texto = msg.message.documentMessage.caption
        } else if(msg.message.buttonsResponseMessage?.selectedButtonId) {
            texto = msg.message.buttonsResponseMessage.selectedButtonId
        } else if(msg.message.listResponseMessage?.selectedRowId) {
            texto = msg.message.listResponseMessage.singleSelectReply?.selectedRowId || ''
        } else if(msg.message.templateButtonReplyMessage?.selectedId) {
            texto = msg.message.templateButtonReplyMessage.selectedId
        }
        
        if(!texto) return

        const metadata = chat.endsWith('@g.us')? await sock.groupMetadata(chat).catch(()=>null) : null
        const groupName = metadata?.subject || 'este grupo'

        if(msg.messageStubType) {
            if(msg.messageStubType === 27) {
                const userJid = msg.messageStubParameters[0]
                const resolvedUser = await resolveJidAsync(userJid, sock, chat)
                const pp = await sock.profilePictureUrl(resolvedUser || userJid, 'image').catch(() => 'https://i.imgur.com/lJ2gQ5a.png')
                let bienvenida = global.bienvenida?.[chat] || `Bienvenido @user al grupo {group}`
                bienvenida = bienvenida.replace('{nombreBot}', nombreBot)
                bienvenida = bienvenida.replace('{group}', groupName)
                bienvenida = bienvenida.replace('@user', `@${cleanNumber(resolvedUser || userJid)}`)
                await sock.sendMessage(chat, {
                    image: { url: pp },
                    caption: bienvenida,
                    mentions: [resolvedUser || userJid]
                })
                return
            }

            if(msg.messageStubType === 28 || msg.messageStubType === 32) {
                const userJid = msg.messageStubParameters[0]
                const resolvedUser = await resolveJidAsync(userJid, sock, chat)
                const pp = await sock.profilePictureUrl(resolvedUser || userJid, 'image').catch(() => 'https://i.imgur.com/lJ2gQ5a.png')
                let despedida = global.despedida?.[chat] || `@${cleanNumber(resolvedUser || userJid)} salió del grupo`
                despedida = despedida.replace('{group}', groupName)
                despedida = despedida.replace('@user', `@${cleanNumber(resolvedUser || userJid)}`)
                await sock.sendMessage(chat, {
                    image: { url: pp },
                    caption: despedida,
                    mentions: [resolvedUser || userJid]
                })
                return
            }
        }

        let prefixUsado = null
        for(let p of prefixes) {
            if(texto.startsWith(p)) {
                prefixUsado = p
                break
            }
        }
        if(!prefixUsado) return

        const args = texto.slice(prefixUsado.length).trim().split(/ +/)
        const command = args.shift().toLowerCase()
        
        const isOwner = owner.includes(sender) || owner.includes(sender.split('@')[0])
        const isCreador = sender === owner[0] || sender === owner[0].split('@')[0]
        const isAdmin = metadata?.participants?.find(p => p.id === sender)?.admin
        const isBotAdmin = metadata?.participants?.find(p => p.id === botJid)?.admin

        const senderType = msg.key.fromMe ? '[BOT]' : '[USER]'

        setImmediate(() => {
            console.log('')
            console.log(chalk.blue('╭─────────────────────────────────────────···'))
            console.log(chalk.blue('│') + chalk.white.bold('  📨 MENSAJE RECIBIDO'))
            console.log(chalk.blue('│'))
            console.log(chalk.blue('│') + chalk.yellow('  Chat: ') + chalk.white(chat))
            console.log(chalk.blue('│') + chalk.yellow('  Grupo: ') + chalk.white(groupName || 'Privado'))
            console.log(chalk.blue('│') + chalk.yellow('  Remitente: ') + chalk.white(msg.pushName || 'Usuario'))
            console.log(chalk.blue('│') + chalk.yellow('  Número: ') + chalk.white(senderNumber))
            console.log(chalk.blue('│') + chalk.yellow('  Tipo: ') + chalk.white(senderType))
            console.log(chalk.blue('│') + chalk.yellow('  Mensaje: ') + chalk.white(texto))
            if(prefixUsado) {
                console.log(chalk.blue('│') + chalk.yellow('  Comando: ') + chalk.green(command))
                console.log(chalk.blue('│') + chalk.yellow('  Args: ') + chalk.gray(args.join(' ') || '(sin argumentos)'))
            }
            console.log(chalk.blue('╰─────────────────────────────────────────···'))
            console.log('')
        })

        if(global.baneados[sender] && chat.endsWith('@g.us')) {
            await sock.sendMessage(chat, { delete: msg.key })
            return
        }

        if(chat.endsWith('@g.us')) {
            if(!global.activos[chat]) global.activos[chat] = {}
            global.activos[chat][sender] = (global.activos[chat][sender] || 0) + 1
        }

        if(global.botsDesactivados[chat] && !isOwner) return
        if(global.socketAsignado[chat] && global.socketAsignado[chat] !== botJid && !isOwner) return

        if(global.antiLink[chat] && chat.endsWith('@g.us')) {
            if(!isAdmin && /(https?:\/\/)?(www\.)?(chat\.whatsapp\.com|wa\.me)/i.test(texto)) {
                await sock.sendMessage(chat, { delete: msg.key })
                if(!isBotAdmin) return sock.sendMessage(chat, { text: 'Necesito ser admin para expulsar' })
                if(!global.avisosLink[chat]) global.avisosLink[chat] = {}
                global.avisosLink[chat][sender] = (global.avisosLink[chat][sender] || 0) + 1
                const avisos = global.avisosLink[chat][sender]
                if(avisos < 3) {
                    await sock.sendMessage(chat, {
                        text: `ANTILINK [${avisos}/3]\n@${senderNumber} Los links de WhatsApp estan prohibidos\nSi lo haces 3 veces seras expulsado`,
                        mentions: [sender]
                    })
                } else {
                    await sock.sendMessage(chat, {
                        text: `@${senderNumber} fue expulsado por enviar 3 links`,
                        mentions: [sender]
                    })
                    await sock.groupParticipantsUpdate(chat, [sender], 'remove')
                    delete global.avisosLink[chat][sender]
                }
                return
            }
        }

        let pluginFile = null
        for(let [name, plugin] of pluginsMeta) {
            if(name === command || (plugin.alias && plugin.alias.includes(command))) {
                pluginFile = plugin
                break
            }
        }

        if(pluginFile) {
            if(chat.endsWith('@g.us') && global.restringidos[chat]?.includes(pluginFile.comando) && !isAdmin) {
                return sock.sendMessage(chat, {
                    text: `Este comando esta restringido en este grupo.`
                })
            }
            try {
                console.log(chalk.green(`[EJECUTANDO] Comando: ${command} por ${senderNumber}`))
                
                let user = await getUser(senderNumber)
                if (!user) {
                    user = await updateUser(senderNumber, {
                        pushName: pushName,
                        genero: 'undefined',
                        edad: 'undefined',
                        desc: 'sin descripcion',
                        birthday: 'no establecido',
                        packname: '𝖬𝖺𝖽𝖾 𝖡𝗒 𝖲𝗍𝖺𝗋𝗅𝗒𝗇',
                        author: '𝖨𝗇𝖿𝗂𝗇𝗂𝗍𝗒 𝖡𝗈𝗍',
                        commands: 0
                    })
                }
                
                if (user && user.pushName !== pushName) {
                    await updateUser(senderNumber, { pushName })
                    user = await getUser(senderNumber)
                }
                
                if (user) {
                    await updateUser(senderNumber, { 
                        commands: (user.commands || 0) + 1 
                    })
                }
                
                await pluginFile.execute(sock, chat, msg, args, {
                    prefix: prefixUsado,
                    isOwner,
                    isCreador,
                    isAdmin,
                    settings: settings,
                    commands: pluginsMeta,
                    botJid,
                    groupMetadata: metadata,
                    groupName: groupName,
                    resolveJid: async (jid) => await resolveJidAsync(jid, sock, chat),
                    resolveLids: async (lids) => await resolveLidsAsync(lids, sock),
                    getUser: async () => await getUser(senderNumber),
                    updateUser: async (data) => await updateUser(senderNumber, data),
                    addExp: async (amount) => await addExp(senderNumber, amount)
                })
                
                await addExp(senderNumber, 10)
                console.log(chalk.green(`[COMPLETADO] Comando: ${command}`))
            } catch(e) {
                console.log(chalk.red('[ERROR]'), e)
                await sock.sendMessage(chat, { text: mensajes.error })
            }
        } else {
            if(command) {
                console.log(chalk.yellow(`[COMANDO NO ENCONTRADO] ${command}`))
            }
        }
    } catch(e) {
        console.log(chalk.red('[HANDLER ERROR]'), e)
    }
}

handler.sock = null
handler.start = (sock, pluginsMeta) => {
    handler.sock = sock
    console.log(chalk.green('Handler iniciado correctamente'))
  }
