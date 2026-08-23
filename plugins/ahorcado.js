import settings from '../../settings.js'
import fs from 'fs'
import path from 'path'
import {
  obtenerAhorcadoActivo,
  iniciarAhorcado,
  finalizarAhorcado,
  normalizarTexto,
} from '../../lib/juegos.js'

const rutaJson = path.resolve('./lib/ahorcado.json')
const PALABRAS_AHORCADO = JSON.parse(fs.readFileSync(rutaJson, 'utf-8'))

const INTENTOS_INICIALES = 6
const DURACION_MS = 3 * 60 * 1000

function representacion(palabra, letrasUsadas) {
  return palabra
    .split('')
    .map((letra) => (letrasUsadas.includes(letra) ? letra : '_'))
    .join(' ')
}

export default {
    comando: 'ahorcado',
    alias: ['hangman'],
    category: 'juegos',
    execute: async (sock, chat, m) => {
        try {
            if (obtenerAhorcadoActivo(chat)) {
                return await sock.sendMessage(chat, {
                    text: `❀ Ya hay un ahorcado activo. Adivina letras con *${settings.prefijo}letra <letra>*.`
                })
            }

            const palabra = normalizarTexto(
                PALABRAS_AHORCADO[Math.floor(Math.random() * PALABRAS_AHORCADO.length)]
            )

            const timeoutId = setTimeout(async () => {
                if (obtenerAhorcadoActivo(chat)) {
                    finalizarAhorcado(chat)
                    await sock.sendMessage(chat, {
                        text: `⏳ Se acabó el tiempo del ahorcado. La palabra era: *${palabra}*.`
                    })
                }
            }, DURACION_MS)

            iniciarAhorcado(chat, {
                palabra,
                letrasUsadas: [],
                intentosRestantes: INTENTOS_INICIALES,
                timeoutId,
            })

            await sock.sendMessage(chat, {
                text:
                `🔤 *Ahorcado*\n\n${representacion(palabra, [])}\n\n` +
                `❤️ Intentos: ${INTENTOS_INICIALES}\n` +
                `Adivina letras con *${settings.prefijo}letra <letra>*`
            })

        } catch (e) {
            console.log(e)
            await sock.sendMessage(chat, { text: `❌ Error al iniciar ahorcado.` })
        }
    }
}