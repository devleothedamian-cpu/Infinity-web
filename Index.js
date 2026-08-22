import { createRequire } from 'module'
import { fileURLToPath, pathToFileURL } from 'url'  
import { dirname, join } from 'path'  
import path from 'path'
import fs from 'fs'
import chalk from 'chalk'
import readline from 'readline'
import { Boom } from '@hapi/boom'
import { default as makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, Browsers } from 'infinity'
import './settings.js'
import { connectDB } from './lib/db.js'

const settings = global
const require = createRequire(import.meta.url) 
const __filename = fileURLToPath(import.meta.url) 
const __dirname = dirname(__filename) 

console.log(chalk.cyan.bold('  ██╗███╗   ██╗███████╗██╗███╗   ██╗██╗████████╗██╗   ██╗'))
console.log(chalk.cyan.bold('  ██║████╗  ██║██╔════╝██║████╗  ██║██║╚══██╔══╝╚██╗ ██╔╝'))
console.log(chalk.cyan.bold('  ██║██╔██╗ ██║█████╗  ██║██╔██╗ ██║██║   ██║    ╚████╔╝ '))
console.log(chalk.cyan.bold('  ██║██║╚██╗██║██╔══╝  ██║██║╚██╗██║██║   ██║     ╚██╔╝  '))
console.log(chalk.cyan.bold('  ██║██║ ╚████║██║     ██║██║ ╚████║██║   ██║      ██║   '))
console.log(chalk.cyan.bold('  ╚═╝╚═╝  ╚═══╝╚═╝     ╚═╝╚═╝  ╚═══╝╚═╝   ╚═╝      ╚═╝   '))
console.log('')
console.log(chalk.magenta.bold('  ██╗    ██╗ █████╗ '))
console.log(chalk.magenta.bold('  ██║    ██║██╔══██╗'))
console.log(chalk.magenta.bold('  ██║ █╗ ██║███████║'))
console.log(chalk.magenta.bold('  ██║███╗██║██╔══██║'))
console.log(chalk.magenta.bold('  ╚███╔███╔╝██║  ██║'))
console.log(chalk.magenta.bold('   ╚══╝╚══╝ ╚═╝  ╚═╝'))
console.log('')
console.log(chalk.yellow.bold('  ███████╗ ██████╗  ██████╗██╗  ██╗███████╗████████╗'))
console.log(chalk.yellow.bold('  ██╔════╝██╔═══██╗██╔════╝██║ ██╔╝██╔════╝╚══██╔══╝'))
console.log(chalk.yellow.bold('  ███████╗██║   ██║██║     █████╔╝ █████╗     ██║   '))
console.log(chalk.yellow.bold('  ╚════██║██║   ██║██║     ██╔═██╗ ██╔══╝     ██║   '))
console.log(chalk.yellow.bold('  ███████║╚██████╔╝╚██████╗██║  ██╗███████╗   ██║   '))
console.log(chalk.yellow.bold('  ╚══════╝ ╚═════╝  ╚═════╝╚═╝  ╚═╝╚══════╝   ╚═╝   '))
console.log('')
console.log(chalk.magenta.bold('  ============ POWERED BY MOONLIGHT STAFF ============'))
console.log('')
console.log(chalk.gray('  Developer: DEV LEO'))
console.log(chalk.gray('  Modo: SILENT'))
console.log('')

let sock
let reconnectAttempts = 0
const MAX_RECONNECT_ATTEMPTS = 50
let handlerInstance = null
let pluginsMeta = new Map()
let watchers = []
let isPluginsLoaded = false

const silentLogger = {
    level: 'silent',
    child: () => silentLogger,
    trace: () => {},
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
    fatal: () => {},
    log: () => {}
}

const pluginsPath = join(__dirname, 'plugins')

function getAllJSFiles(dir) {
    let results = []
    if(!fs.existsSync(dir)) return results
    const list = fs.readdirSync(dir)
    for(const file of list) {
        const filePath = join(dir, file)
        const stat = fs.statSync(filePath)
        if(stat && stat.isDirectory()) {
            results = results.concat(getAllJSFiles(filePath))
        } else if(file.endsWith('.js')) {
            results.push(filePath)
        }
    }
    return results
}

async function loadPlugins() {
    pluginsMeta.clear()
    const files = getAllJSFiles(pluginsPath)
    let loadedCount = 0
    for(const file of files) {
        try {
            const pluginPath = pathToFileURL(file).href
            const plugin = await import(pluginPath + `?v=${Date.now()}`)
            if(plugin.default && plugin.default.comando) {
                pluginsMeta.set(plugin.default.comando, plugin.default)
                const fileName = path.basename(file)
                console.log(chalk.green(`⭐ ${fileName} cargado con exito`))
                loadedCount++
            }
        } catch(e) {
            const fileName = path.basename(file)
            console.log(chalk.red(`❌ Error cargando ${fileName}:`), e.message)
        }
    }
    console.log(chalk.green(`✅ Total: ${loadedCount} comandos cargados`))
    isPluginsLoaded = true
}

function watchFiles() {
    if(watchers.length > 0) {
        watchers.forEach(w => w.close())
        watchers = []
    }
    
    const watcher = fs.watch(pluginsPath, { recursive: true }, async (event, filename) => {
        if(filename && filename.endsWith('.js')) {
            const fileName = path.basename(filename)
            console.log(chalk.yellow(`🔄 Detectado cambio en: ${fileName}`))
            setTimeout(async () => {
                await loadPlugins()
                console.log(chalk.green(`⭐ ${fileName} recargado con exito`))
            }, 500)
        }
    })
    watchers.push(watcher)
    
    const handlerPath = join(__dirname, 'handler.js')
    if(fs.existsSync(handlerPath)) {
        const handlerWatcher = fs.watch(handlerPath, async (event) => {
            console.log(chalk.yellow('🔄 Detectado cambio en handler.js'))
            setTimeout(async () => {
                try {
                    const newHandler = await import(pathToFileURL(handlerPath).href + `?v=${Date.now()}`)
                    handlerInstance = newHandler.default
                    if(handlerInstance && sock) {
                        handlerInstance.start(sock, pluginsMeta)
                        console.log(chalk.green('⭐ handler.js recargado con exito'))
                    }
                } catch(e) {
                    console.log(chalk.red('❌ Error recargando handler.js:'), e.message)
                }
            }, 500)
        })
        watchers.push(handlerWatcher)
    }
}

await loadPlugins()
watchFiles()

async function loadHandler() {
    try {
        const module = await import('./handler.js')
        return module.default
    } catch(e) {
        console.log(chalk.red('Error cargando handler:'), e.message)
        return null
    }
}

async function askPairingCode() {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    const question = (text) => new Promise((resolve) => rl.question(text, resolve))
    
    console.log('')
    console.log(chalk.blue.bold('  ======== METODOS DE VINCULACION ========'))
    console.log(chalk.yellow.bold('  [1] CODIGO DE 8 DIGITOS'))
    console.log(chalk.green.bold('  [2] CODIGO QR'))
    console.log(chalk.red.bold('  [3] SALIR'))
    console.log(chalk.blue.bold('  ========================================'))
    console.log('')
    
    let choice = await question(chalk.cyan.bold('SELECCIONE UNA OPCION: '))
    
    if(choice === '1') {
        let phone = await question(chalk.yellow.bold('INGRESE NUMERO CON CODIGO DE PAIS: '))
        phone = phone.replace(/[^0-9]/g, '')
        if(phone.length > 6) {
            try {
                let code = await sock.requestPairingCode(phone)
                console.log('')
                console.log(chalk.green.bold('  ======== CODIGO DE VINCULACION ========'))
                console.log(chalk.white.bold('  ' + code))
                console.log(chalk.green.bold('  ========================================'))
                console.log('')
                console.log(chalk.yellow('Ingresa este codigo en WhatsApp > Dispositivos vinculados'))
            } catch(e) {
                console.log(chalk.red('Error: Numero invalido'))
            }
        } else {
            console.log(chalk.red('Numero demasiado corto'))
        }
    } else if(choice === '2') {
        console.log(chalk.green.bold('Escanea el QR con WhatsApp'))
        console.log(chalk.yellow('Esperando QR...'))
    } else {
        console.log(chalk.red('Saliendo...'))
        process.exit(0)
    }
    
    rl.close()
}

async function startBot() {
    const authPath = join(__dirname, 'auth')
    
    await connectDB()
    
    if(fs.existsSync(authPath)){
        const files = fs.readdirSync(authPath)
        if(files.length === 0){
            fs.rmSync(authPath, { recursive: true, force: true })
            console.log(chalk.yellow('Carpeta auth vacia. Creando nueva...'))
        } else {
            console.log(chalk.green('Sesion encontrada. Conectando...'))
        }
    }

    let { state, saveCreds } = await useMultiFileAuthState(authPath)
    let { version } = await fetchLatestBaileysVersion()

    const connectionOptions = {
        version,
        auth: state,
        printQRInTerminal: false,
        logger: silentLogger,
        browser: Browsers.macOS('Chrome'),
        markOnlineOnConnect: false
    }

    if(sock){
        try { sock.end() } catch(e) {}
        sock = undefined
    }

    sock = makeWASocket(connectionOptions)
    
    sock.ev.on('creds.update', saveCreds)
    
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update
        
        if(connection === 'open') {
            reconnectAttempts = 0
            console.log('')
            console.log(chalk.green.bold('BOT CONECTADO - MODO SILENCIOSO'))
            console.log(chalk.magenta('Infinity Wa Socket'))
            console.log(chalk.magenta('Powered By Moonlight Staff'))
            console.log('')
            
            if(!handlerInstance) {
                handlerInstance = await loadHandler()
            }
            
            if(handlerInstance) {
                handlerInstance.start(sock, pluginsMeta)
                
                sock.ev.on('messages.upsert', async (m) => {
                    try {
                        await handlerInstance(sock, m, pluginsMeta)
                    } catch(e) {
                        console.log(chalk.red('Error en handler:'), e.message)
                    }
                })
                
                console.log(chalk.green('Handler iniciado correctamente'))
                console.log(chalk.green('Esperando mensajes...'))
                console.log('')
            }
        }
        
        if(connection === 'close') {
            let reason = new Boom(lastDisconnect?.error)?.output?.statusCode
            console.log(chalk.red(`Desconectado. Razon: ${reason || 'Desconocida'}`))
            
            if(reason === DisconnectReason.loggedOut || reason === 401 || reason === 403){
                fs.rmSync(authPath, { recursive: true, force: true })
                console.log(chalk.red('Sesion cerrada. Borra auth e inicia de nuevo'))
                process.exit(1)
            } else {
                reconnectAttempts++
                if(reconnectAttempts > MAX_RECONNECT_ATTEMPTS) {
                    console.log(chalk.red(`Demasiados reintentos (${MAX_RECONNECT_ATTEMPTS}). Reiniciando proceso...`))
                    process.exit(1)
                }
                const delay = Math.min(3000 * reconnectAttempts, 30000)
                console.log(chalk.yellow(`Reconectando en ${delay/1000}s... (Intento ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`))
                setTimeout(startBot, delay)
            }
        }
    })
    
    if(!sock.authState.creds.registered) {
        await askPairingCode()
    }
}

startBot().catch(err => {
    console.log(chalk.red('Error fatal:'), err)
    setTimeout(startBot, 5000)
})

process.on('uncaughtException', (err) => {
    if(err.message?.includes('Connection Closed') || err.message?.includes('rate-overlimit')) return
    console.log(chalk.red('Uncaught Exception:'), err.message)
})

process.on('unhandledRejection', (err) => {
    if(err?.message?.includes('Connection Closed') || err?.message?.includes('rate-overlimit')) return
    console.log(chalk.red('Unhandled Rejection:'), err?.message || err)
})

process.on('SIGINT', () => {
    console.log(chalk.yellow('\nApagando bot...'))
    if(sock) {
        try { sock.end() } catch(e) {}
    }
    process.exit(0)
})
