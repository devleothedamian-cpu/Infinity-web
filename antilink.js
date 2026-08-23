import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
    resolveJidAsync,
    resolveLidAsync,
    patchGroupMetadata
} from '#serialize';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ANTILINK_FILE = path.join(__dirname, 'data', 'antilink.json');
const PRIMARIOS_FILE = path.join(process.cwd(), 'databases', 'primarios.json');

const linkRegex = /(?:https?:\/\/)?(?:chat\.whatsapp\.com\/[A-Za-z0-9]{20,24}(?:\?[^\s]*)?|whatsapp\.com\/channel\/[A-Za-z0-9]{20,24}(?:\?[^\s]*)?)/i;

function loadAntilink() {
    try {
        if (fs.existsSync(ANTILINK_FILE)) {
            const data = fs.readFileSync(ANTILINK_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (e) {
        console.error('Error cargando antilink:', e);
    }
    return {};
}

function getPrimaryBot(groupId) {
    try {
        if (fs.existsSync(PRIMARIOS_FILE)) {
            const data = JSON.parse(fs.readFileSync(PRIMARIOS_FILE, 'utf8'));
            return data[groupId] || null;
        }
    } catch (e) {}
    return null;
}

function getBotNumber(sock) {
    if (sock.phoneNumber) {
        return sock.phoneNumber.replace(/[^0-9]/g, '');
    } else if (sock.user?.id) {
        return sock.user.id.split(':')[0].replace(/[^0-9]/g, '');
    }
    return '';
}

function cleanNumber(number) {
    if (!number) return '';
    let cleaned = String(number).split('@')[0];
    cleaned = cleaned.split(':')[0];
    cleaned = cleaned.replace(/\D/g, '');
    return cleaned;
}

function esLinkValido(texto) {
    if (!texto) return false;
    return linkRegex.test(texto);
}

async function resolveParticipantNumber(participant, sock, groupId) {
    if (!participant) return null;
    
    if (participant.phoneNumber) {
        return cleanNumber(participant.phoneNumber);
    }
    
    if (participant.id) {
        if (!participant.id.endsWith('@lid')) {
            return cleanNumber(participant.id);
        }
        
        try {
            const resolved = await resolveJidAsync(participant.id, sock, groupId);
            if (resolved && !resolved.endsWith('@lid')) {
                return cleanNumber(resolved);
            }
        } catch (e) {}
        
        try {
            const resolvedLid = await resolveLidAsync(participant.id, sock);
            if (resolvedLid) {
                return cleanNumber(resolvedLid);
            }
        } catch (e) {}
        
        return cleanNumber(participant.id);
    }
    
    return null;
}

export default async (sock, msg) => {
    try {
        if (!msg.key?.remoteJid?.includes('@g.us')) return;

        patchGroupMetadata(sock);

        const body = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
        if (!body) return;

        const from = msg.key.remoteJid;
        const sender = msg.sender || msg.key?.participant || msg.key?.remoteJid;

        if (!sender || sender === from || sender.includes('@g.us')) {
            return;
        }

        const senderNumber = cleanNumber(sender);
        if (!senderNumber) {
            return;
        }

        const botId = cleanNumber(sock.user.id);
        if (senderNumber === botId) return;

        const primaryData = getPrimaryBot(from);
        const currentBotNumber = getBotNumber(sock);
        const isPrimary = !primaryData || primaryData.botNumber === currentBotNumber;

        if (!isPrimary) {
            return;
        }

        const esLink = esLinkValido(body);
        if (!esLink) {
            return;
        }

        const antilinkData = loadAntilink();
        const isAntilinkActive = antilinkData[from] !== false;
        if (!isAntilinkActive) return;

        let groupMetadata = await sock.groupMetadata(from).catch(() => null);
        if (!groupMetadata) return;

        let isAdmin = false;

        for (const p of groupMetadata.participants) {
            const pNumber = await resolveParticipantNumber(p, sock, from);
            if (pNumber === senderNumber) {
                if (p.admin === 'admin' || p.admin === 'superadmin') {
                    isAdmin = true;
                }
                break;
            }
        }

        if (isAdmin) {
            return;
        }

        console.log(`[ANTILINK] Usuario ${senderNumber} envió link, eliminando...`);

        try {
            await sock.sendMessage(from, {
                delete: {
                    remoteJid: from,
                    fromMe: false,
                    id: msg.key.id,
                    participant: sender
                }
            });
            console.log(`[ANTILINK] Mensaje eliminado de ${senderNumber}`);
        } catch (e) {
            console.error('Error eliminando mensaje:', e);
        }

        try {
            await sock.groupParticipantsUpdate(from, [sender], 'remove');
            console.log(`[ANTILINK] Usuario ${senderNumber} eliminado del grupo`);

            const isChannelLink = /whatsapp\.com\/channel\//i.test(body);
            const tipoLink = isChannelLink ? 'canales' : 'grupos';

            try {
                const warnMsg = `> ⛔ Se ha eliminado a @${senderNumber} del grupo por \`Anti-Link\`, no permitimos enlaces de *${tipoLink}*.`;
                await sock.sendMessage(from, {
                    text: warnMsg,
                    mentions: [sender]
                });
            } catch (e) {
                console.error('Error enviando mensaje de advertencia:', e);
            }

        } catch (e) {
            if (e.message?.includes('not-authorized') || e.message?.includes('not authorized')) {
                console.log(`[ANTILINK] No se pudo eliminar usuario (not-authorized)`);
                return;
            }
            if (e.message?.includes('participant')) {
                console.log(`[ANTILINK] Error con el participante: ${e.message}`);
                return;
            }
            console.error('Error eliminando usuario:', e);
        }

    } catch (error) {
        console.error('Error en antilink:', error);
    }
};
