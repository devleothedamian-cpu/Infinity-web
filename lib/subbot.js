import {
  Browsers,
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  DisconnectReason,
  jidDecode,
} from '@whiskeysockets/baileys'
import NodeCache from 'node-cache'
import pino from 'pino'
import fs from 'fs'
import chalk from 'chalk'
import handler from '../handler.js'
import { smsg } from './smsg.js'

if (!global.conns) global.conns = []
const msgRetryCounterCache = new NodeCache({ stdTTL: 0, checkperiod: 0 })
const userDevicesCache = new NodeCache({ stdTTL: 0, checkperiod: 0 })
const groupCache = new NodeCache({ stdTTL: 3600, checkperiod: 300 })
let reintentos = {}

const cleanJid = (jid = '') => jid.replace(/:\d+/, '').split('@')[0]
const logger = pino({ level: 'silent' })

export function listarSubbots() { return global.conns }
export function contarSubbotsDe(jid) { return global.conns.filter(c => c.creador === jid).length }
export function iniciarSubbot({ numero, creadorJid, chatOrigen, sockPrincipal }) {
    return new Promise(async (resolve) => {
        const caption = `🔑 *VINCULACIÓN SUB-BOT*\n\nAbre WhatsApp > Dispositivos vinculados > Vincular con número`
        const flags = { [creadorJid]: true }
        await startSubBot({ sender: creadorJid, chat: chatOrigen, key: { id: 'serbot' } }, sockPrincipal, caption, true, numero, chatOrigen, flags, true)
        resolve({ ok: true })
    })
}

export async function startSubBot(m, clientPrincipal, caption = '', isCode = false, phone = '', chatId = '', commandFlags = {}, isCommand = false) {
  const id = phone || cleanJid(m?.sender)
  const sessionFolder = `./Sessions/Subs/${id}`

  if (!fs.existsSync('./Sessions')) fs.mkdirSync('./Sessions')
  if (!fs.existsSync('./Sessions/Subs')) fs.mkdirSync('./Sessions/Subs')

  const { state, saveCreds } = await useMultiFileAuthState(sessionFolder)
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    logger,
    printQRInTerminal: false,
    browser: Browsers.ubuntu(global.nombreBot || 'INFINITY'),
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    markOnlineOnConnect: true,
    getMessage: async () => undefined,
    msgRetryCounterCache,
    userDevicesCache,
    cachedGroupMetadata: async (jid) => groupCache.get(jid),
    version,
  })

  sock.isInit = false
  sock.tipo = 'Sub-Bot' // <--- AQUÍ VA EL TIPO
  sock.ev.on('creds.update', saveCreds)
  sock.decodeJid = (jid) => {
    if (!jid) return jid
    if (/:\d+@/gi.test(jid)) {
      let decode = jidDecode(jid) || {}
      return (decode.user && decode.server && decode.user + '@' + decode.server) || jid
    } else return jid
  }

  sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
    if (connection === 'open') {
      sock.isInit = true
      sock.userId = cleanJid(sock.user?.id)
      sock.creador = m?.sender || m?.creadorJid
      sock.tipo = 'Sub-Bot' // <--- Y AQUÍ TAMBIÉN
      if (!global.conns.find((c) => c.userId === sock.userId)) {
        global.conns.push(sock)
      }
      console.log(chalk.green(`✨ SUB-BOT conectado: ${sock.userId} | Tipo: ${sock.tipo}`))
    }
    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode || 0
      if ([401, 403].includes(reason)) {
        try { fs.rmSync(sessionFolder, { recursive: true, force: true }) } catch {}
        global.conns = global.conns.filter(c => c.userId!== sock.userId)
      } else {
        setTimeout(() => startSubBot(m, clientPrincipal, caption, isCode, phone, chatId, {}, isCommand), 3000)
      }
    }
    if (qr && isCode && phone) {
      try {
        let codeGen = await sock.requestPairingCode(phone)
        codeGen = codeGen.match(/.{1,4}/g)?.join("-") || codeGen
        await clientPrincipal.sendMessage(chatId, { text: `${caption}\n\n\`\`${codeGen}\`\`` })
      } catch (err) {
        console.log(err)
      }
    }
  })

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type!== 'notify') return
    for (let raw of messages) {
      if (!raw.message) continue
      let msg = await smsg(sock, raw)
      try {
        global.tipo = 'Sub-Bot' // para que el menú lo lea si usa global.tipo
        await handler(sock, { messages: [raw] })
      } catch (err) {
        console.log(`Error Sub: ${err}`)
      }
    }
  })
  return sock
}

export function getSubBots() { return global.conns.map(c => c.userId) }
export function detenerSubBot(id) {
    const sub = global.conns.find(c => c.userId === id)
    if(sub) {
        sub.ws.close()
        global.conns = global.conns.filter(c => c.userId!== id)
        return true
    }
    return false
}
