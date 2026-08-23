const juegos = new Map()

export default {
    comando: 'sopa',
    alias: ['sopadeletras', 'buscarpalabra', 'wordsearch'],
    category: 'juegos',
    execute: async (sock, chat, m) => {
        const LADO = 12
        const PALABRAS = ['ALGORITMO','ANDROID','ANIME','ARTE','CIENCIA','GITHUB','MUSICA','NARUTO','ONEPIECE','POKEMON','TECNOLOGIA','WHATSAPP','YOUTUBE','ZELDA','JUEGO','CODIGO','MUNDO','GALAXIA','MEXICO','ARGENTINA']
        const LETRAS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        const nums = ["⓿","❶","❷","❸","❹","❺","❻","❼","❽","❾","❿","⓫","⓬","⓭","⓮","⓯"]

        const texto = m.text.split(' ').slice(1).join('').trim()

        if (juegos.has(chat)) {
            let data = juegos.get(chat)
            if (data.user!== m.sender) {
                await sock.sendMessage(chat, { react: { text: '⛔', key: m.key } })
                return sock.sendMessage(chat, { text: `⛔ @${data.user.split('@')[0]} está jugando ahora`, mentions: [data.user] })
            }
            if (!texto) return sock.sendMessage(chat, { text: `Escribe fila+columna Ej: ${m.prefix || '.'}sopa 28` })

            if (`${data.fila}${data.col}` == texto) {
                juegos.delete(chat)
                await sock.sendMessage(chat, { react: { text: '✅', key: m.key } })
                return sock.sendMessage(chat, { text: `✅ ¡Ganaste! Era *${data.palabra}* en ${data.dir} Fila ${data.fila} Col ${data.col}` })
            } else {
                data.intentos--
                if (data.intentos <= 0) {
                    juegos.delete(chat)
                    await sock.sendMessage(chat, { react: { text: '❌', key: m.key } })
                    return sock.sendMessage(chat, { text: `❌ Se acabaron intentos! Era *${data.palabra}* en ${data.dir} Fila ${data.fila} Col ${data.col}` })
                }
                juegos.set(chat, data)
                let pista = data.intentos == 1? `\n👾 Pista: va en dirección ${data.dir}` : ''
                await sock.sendMessage(chat, { react: { text: '❌', key: m.key } })
                return sock.sendMessage(chat, { text: `❌ Te quedan ${data.intentos}${pista}\n\n${data.tablero}` })
            }
        }

        // Crear juego
        const PALABRA = PALABRAS[Math.floor(Math.random() * PALABRAS.length)]
        const DIRS = ["horizontal","vertical","diagonalDerecha","diagonalIzquierda"]
        const DIR = DIRS[Math.floor(Math.random() * DIRS.length)]

        let sopa = Array.from({length: LADO}, () => Array(LADO).fill(null))
        let fila, col, ok = false
        while (!ok) {
            fila = Math.floor(Math.random() * LADO)
            col = Math.floor(Math.random() * LADO)
            let entra = true
            for (let i = 0; i < PALABRA.length; i++) {
                if (DIR === "horizontal" && col + i >= LADO) entra = false
                if (DIR === "vertical" && fila + i >= LADO) entra = false
                if (DIR === "diagonalDerecha" && (fila + i >= LADO || col + i >= LADO)) entra = false
                if (DIR === "diagonalIzquierda" && (fila + i >= LADO || col - i < 0)) entra = false
            }
            if (!entra) continue
            for (let i = 0; i < PALABRA.length; i++) {
                if (DIR === "horizontal") sopa[fila][col + i] = PALABRA[i]
                if (DIR === "vertical") sopa[fila + i][col] = PALABRA[i]
                if (DIR === "diagonalDerecha") sopa[fila + i][col + i] = PALABRA[i]
                if (DIR === "diagonalIzquierda") sopa[fila + i][col - i] = PALABRA[i]
            }
            ok = true
        }

        let tablero = " " + [...Array(LADO).keys()].map(n => nums[n]).join(" ") + "\n"
        for (let i = 0; i < LADO; i++) {
            let f = nums[i] + " "
            for (let j = 0; j < LADO; j++) f += (sopa[i][j] || LETRAS[Math.floor(Math.random()*LETRAS.length)]) + " "
            tablero += f + "\n"
        }

        juegos.set(chat, { user: m.sender, palabra: PALABRA, fila, col, dir: DIR.replace(/([A-Z])/g,' $1').toLowerCase(), tablero, intentos: 3 })

        await sock.sendMessage(chat, { react: { text: '☁️', key: m.key } })
        await sock.sendMessage(chat, {
            text: `☁️ *SOPA DE LETRAS* ☁️\n*Palabra:* ${PALABRA}\n\nEscribe: ${m.prefix || '.'}sopa <fila><columna> Ej: 28 = Fila 2 Col 8\n\n*${PALABRA.split("").join(" ")}*\n\n${tablero}`
        })
    }
}