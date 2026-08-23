function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)]
}

const RETOS = [
"Pasa el pack de una hormiga",
"Dile a tus amigos que te vas a vivir a EU y mándame una captura",
"Grita desde la ventana que quieres mamar y mándame el vídeo",
"Escribe el nombre de tu crush",
"Debes de poner el nombre de mi creador en tu estado de WhatsApp",
"Envíame una fotografía tuya",
"Dibuja en tu cuerpo el nombre de alguien del grupo y manda foto",
"Hazte una foto dándole un beso a una Televisión",
"Mándame una foto en ropa interior",
"Escribe en tu estado que te gusta comer tierra",
"Pon la foto de alguien del sexo opuesto del grupo 3 días de perfil",
"Canta: Un pato que va cantando alegremente cua cua 🦆 - manda audio",
"Envía un mensaje a tu ex y dile todavía me gustas",
"Envía un audio diciendo amo a The Shadow Brokers",
"Dile a tu crush que la amas y pasa captura",
"Envía una foto sin taparte la cara",
"Envía un video bailando",
"Invita a desconocidos a tomarse selfie contigo y envíalo",
"Envía a 3 contactos: 'Estoy embarazad@'",
"Tome algo cerca, mézclelo con chile y bébalo",
"Llama a un contacto random y dile 'te amo'",
"Compra lo más barato de la cafetería y di llorando: 'es lo más caro que he comprado'",
"Compra una coca y riega flores frente a todos",
"Ve al refri con ojos cerrados, agarra algo random y cómetelo",
"Párate en medio de la cancha y grita 'TE AMO MI PRÍNCIPE / PRINCESA'",
"Dile a alguien: 'Estoy a su servicio, Majestad'",
"Camina aplaudiendo cantando 'Feliz cumpleaños' por el pasillo",
"Arrodíllate y dile '¿Cásate conmigo?' al primero que entre",
"Haz un tocado absurdo con papel y posa para fotos",
"Dile a la más bonita de la clase: 'ERES HERMOSA, NO MIENTES'",
"Dile a alguien: 'Me dijeron que era tu gemelo, me operé, esto es serio'",
"Tira el cuaderno de alguien a la basura diciendo 'nadie entiende esto'",
"¡Arranca pelo de tu pierna 3 veces!",
"Escribe a tus padres que los extrañas con caritas tristes",
"Busca en Google cosas raras como tripofobia",
"Siéntate en medio de la cancha como si fuera playa",
"Llena tu boca de agua y aguanta 2 rondas sin reír",
"Saluda al primero que entre: '¡Bienvenido a Quién quiere ser millonario!'",
"Texto a tus padres: 'Hola hermano! compré Playboy!'",
"Texto a tus padres: 'Ya sé que soy adoptado'",
"Come una cucharada de salsa dulce + salsa salada",
"Come algo sin usar las manos",
"Rompe un huevo con la cabeza",
"Baila como Girls Generation / Super Junior frente a la clase",
"Iza el asta sin bandera",
"Copia los peinados de tus amigos",
"Canta HAI TAYO bailando frente a gente",
"Canta Baby Shark fuerte en el salón",
"Pide prestado algo a los vecinos",
"Pide firma al profe más feroz diciendo 'te admiro'",
"Pide dinero en la calle: 'No tengo para el bus'",
"Bebe algo raro preparado por el grupo (no peligroso)",
"Habla con tu crush solo con emoticonos de miedo",
"Canta tu peli Disney favorita gritando afuera",
"Di del 1 al 20 azul rápido sin error, si fallas repite",
"Ponte corona de papel y di 'HONOR AL REY' señalando con regla",
"Ponte pantalones al revés hasta mañana",
"Abraza a quien NO te cae bien y di 'gracias por ser el mejor'",
"Ve a campo abierto y corre gritando 'Estoy loco'",
"Regala una flor a un desconocido del sexo opuesto",
"Di a un random en la calle: 'No sabes que eres hermosa' estilo One Direction",
"Finge estar poseído por un tigre",
"Silba con la boca llena",
"Sé mesero de tus amigos en el almuerzo",
"Usa calcetines como guantes",
"Usa el sombrero más raro durante la próxima ronda",
"Llama a tu mamá y di 'quiero casarme ya'",
"Llama a tu ex y di 'te extraño'",
"Cambia ropa con el más cercano hasta la próxima ronda",
"Actualiza estado con palabras que empiecen con 'S'",
"Sube video cantando a YouTube",
"Pinta uñas manos y pies diferente por una semana",
"Come 2 cucharadas de arroz sin nada",
"Envía '🦄💨' cada vez que escribas en grupo por 1 día",
"Di '¡Bienvenido a Quién quiere ser millonario!' en todos tus grupos",
"Canta el coro de la última canción que escuchaste",
"Manda audio a tu ex: 'hola, quiero llamar, te extraño🥺👉🏼👈🏼'",
"Haz 1 rima para el primer jugador",
"Cuenta tu anécdota más vergonzosa",
"Cambia tu nombre a 'Gay' por 24 horas",
"¡Menciona tu tipo de novia!",
"Di 'Estoy enamorado de ti, ¿quieres ser mi novio?' al último que hablaste",
"Háblale a tu ex y di 'te amo, vuelve' manda captura"
]

export default {
    comando: 'reto',
    alias: ['challenge', 'dare'],
    category: 'fun',
    cooldown: 3,
    execute: async (sock, chat, m) => {
        try {
            const reto = pickRandom(RETOS)

            let texto = `*┏━- - - - ⚘ - - - -━┓*\n\n🪽 *"${reto}"*\n\n*┗━- - - - ⚘ - - - -━┛*`

            await sock.sendMessage(chat, { react: { text: '🎲', key: m.key } })
            await sock.sendMessage(chat, { 
                text: `🚩 *¡Buscando un reto para ti!*\n\n${texto}` 
            }, { quoted: m })

        } catch (err) {
            console.log(err)
            await sock.sendMessage(chat, { react: { text: '❌', key: m.key } })
        }
    }
}