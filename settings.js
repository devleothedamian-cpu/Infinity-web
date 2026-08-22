import { watchFile, unwatchFile } from 'fs';
import { fileURLToPath } from 'url';

const nombreCanal = 'INFINITY CHANNEL';
const canalLink = 'https://whatsapp.com/channel/0029Vb7vqNDCsU9MnOn8UN0U';
const canalID = '120363425415754278@newsletter';

global.nombreBot = 'INFINITY-BOT';
global.developer = 'DEV LEO';
global.footer = '© 2026 INFINITY-BOT';
global.tipo = 'principal';

global.icono = 'https://litter.catbox.moe/mjtxin.jpg';
global.banner = 'https://raw.githubusercontent.com/JTxs00/uploads/main/1787261144433.jpeg';

global.nombreCanal = nombreCanal;
global.canalID = canalID;
global.canalLink = canalLink;
global.pagina = 'https://moonstaff.onrender.com/';

global.owner = [
    '5492645746772',
    '5492645576493',
    '5219992042946'
];

global.prefixes = ['.', '/', '#', '🥷', '🤖', '⚡'];

global.mensajes = {
    encendido: (tipo) => `🤖 *INFINITY-BOT ACTIVO* \n\n👨‍💻 Dev: DEV LEO\n📢 Tipo: ${tipo === 'principal'? '👑 Principal' : '🤖 Sub-Bot'}\n📢 Canal: ${nombreCanal}\n🔗 ${canalLink}\nEstado: Online ✅`,
    bienvenida: (tipo) => `👋 *Bienvenido/a* \n\nSoy *INFINITY-BOT* de DEV LEO\nTipo: ${tipo === 'principal'? '👑 Principal' : '🤖 Sub-Bot'}\n📢 Siguenos: ${nombreCanal}\nUsa .menu para ver comandos\n© 2026 INFINITY-BOT`,
    estado: (tipo) => `⚡ *ESTADO DEL BOT*\n\n🤖 Nombre: INFINITY-BOT\n👨‍💻 Dev: DEV LEO\n📢 Tipo: ${tipo === 'principal'? '👑 Principal' : '🤖 Sub-Bot'}\n© 2026 INFINITY-BOT`,
    sinPermiso: `*No tienes permiso para usar este comando* ❌`,
    soloPrincipal: `⛔ Este comando es solo para el bot principal`,
    soloSubBots: `⛔ Este comando es solo para sub-bots`,
    recargando: `🔄 Recargando plugins...`,
    recargado: `✅ Plugins recargados correctamente`,
    actualizado: `📦 Actualizando desde github...`,
    reiniciando: `♻️ Reiniciando bot...`,
    limpiado: `🧹 Sesión limpiada. Escanea de nuevo`,
    error: `❌ Ocurrió un error. Intenta de nuevo`,
    online: `✅ Bot online`
};

const file = fileURLToPath(import.meta.url);
watchFile(file, () => {
    unwatchFile(file);
    import(`${file}?update=${Date.now()}`);
});
