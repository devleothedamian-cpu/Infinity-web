import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { prepareWAMessageMedia } from 'baileys';
import db from '#db';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WELCOME_FILE = path.join(__dirname, 'data', 'welcome.json');
const GOODBYE_FILE = path.join(__dirname, 'data', 'goodbye.json');
const ALERTS_FILE = path.join(__dirname, 'data', 'alerts.json');
const PRIMARIOS_FILE = path.join(process.cwd(), 'databases', 'primarios.json');

const LINK_FIJO = 'https://serbot-akari.vercel.app/';

function loadWelcome() {
    try {
        if (fs.existsSync(WELCOME_FILE)) {
            const data = fs.readFileSync(WELCOME_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (e) {
        console.error('Error cargando mensajes de bienvenida:', e);
    }
    return {};
}

function loadGoodbye() {
    try {
        if (fs.existsSync(GOODBYE_FILE)) {
            const data = fs.readFileSync(GOODBYE_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (e) {
        console.error('Error cargando mensajes de despedida:', e);
    }
    return {};
}

function loadAlerts() {
    try {
        if (fs.existsSync(ALERTS_FILE)) {
            const data = fs.readFileSync(ALERTS_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (e) {
        console.error('Error cargando alertas:', e);
    }
    return {};
}

async function getDisplayName(number) {
    try {
        const user = await db.getUser(number);
        return user ? user.pushName : number;
    } catch (e) {
        return number;
    }
}

function cleanNumber(number) {
    if (!number) return '';
    if (typeof number === 'object') {
        number = number.id || number.jid || number.phoneNumber || '';
    }
    if (typeof number === 'string') {
        let cleaned = number.replace(/@.+/, '').split(':')[0];
        cleaned = cleaned.replace(/\D/g, '');
        return cleaned;
    }
    return '';
}

function loadConfig(sock) {
    try {
        const botNumber = getBotNumber(sock);
        const botConfigPath = path.join(process.cwd(), 'subs', botNumber, 'config.js');
        
        if (fs.existsSync(botConfigPath)) {
            const configContent = fs.readFileSync(botConfigPath, 'utf8');
            const match = configContent.match(/export default\s+({[\s\S]*})/);
            if (match && match[1]) {
                return eval('(' + match[1] + ')');
            }
        }
    } catch (e) {
        console.error('Error cargando config del bot:', e);
    }
    
    return {
        nombre: 'INFINITY',
        nombre2: 'INFINITY WAB',
        prefix: '.',
        banner: 'https://files.catbox.moe/vtf23r.jpeg',
        canalId: '',
        canalNombre: ''
    };
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

function getGroupAdmins(participants) {
    return (participants ?? []).filter(p => p.admin === 'admin' || p.admin === 'superadmin').map(p => p.id).filter(Boolean);
}

const DEFAULT_WELCOME = 
`ㅤㅤㅤׄㅤㅤׅ  ㅤׄㅤ⋱ㅤㅤ⁝ㅤㅤ⋰.ㅤׄㅤㅤׅㅤㅤׄㅤ.
ㅤㅤ.ㅤ     ︵⌒⏜︵፝֟ᮬ⌒፝֟⏜︵ᮬ⌒⏜ᮬ..
ㅤㅤㅤㅤ.   ⋰⠟ 🅗⃞︩︪ᧉᩨყ࣪ ࣭🅗⃞ᧉ֟፝͡ᩞყ࣪ 🪭֟፝͜͡✷ᩬ͡꯴꯭֟፝꯴\` ⠻⋱
ㅤㅤㅤׅ   ׄ  ׅ ⣼ ⵂ ፝֟͜͡ⵂ ⣧ׄ 🅦⃞ᥱ︩︪ʅִׄƈσ፝֟͡ɱҽ ֺ ⣼ ⵂ ፝֟͜͡ⵂ ⣧ׄ  ׅ  ׂ
 ꢸ۪࣫Ა᮫ׄ‎.✰ᰋ* Ჩׅᦅlα @user, bı๋ᧉnvᧉnı๋ძᦅ αl ᦨ︩︪ɾupׁᦅ @group. 
ᧉ᥍pׁᧉɾᦅ quᧉ ɫׅu ᧉ᥍ɫׅαძíα pׁᦅɾ αquí ᥍ᧉα ⲥ͠óꭑׅᦅძα, lαɾᦨ︩︪α ყׁ ძuɾαძᧉɾα. nᦅ ɫׅᧉ ᦅlvı๋ძᧉ᥍ ძᧉ ᥍ᧉᦨ︩︪uı๋ɾ lα᥍ ɾᧉᦨ︩︪lα᥍, ¡ꭑׅuⲥ͠Ჩׅα᥍ ᦨ︩︪ɾαⲥ͠ı๋α᥍ pׁᦅɾ ᧉ᥍ɫׅαɾ αquí!🫶🏼
⠂⋆ ･ ⠄⠂⋆ ･ ⠄⠂⋆ ･ ⠄⠂⋆ ･⠂⋆ ･ ⠄
> *sᴇʀ-ʙᴏᴛ › https://serbot-akari.vercel.app/*
> *ᴍᴀᴅᴇ ᴡɪᴛʜ Iʑ๋໋α̫۫ꪱᩙ*`;

const DEFAULT_GOODBYE =
`✿ @user

  ╭   ۪ ໋ 𝆬ฅ ฅ (ᐡ ⩌⩊⩌ ᐡ) 𝆬   𖹭ᩧ𑁀🌻̥  ֵ   ֘ ⪩⪨  ໋໋╮
         𖹭 ㅤ  𝓖𝘰𝘰𝘥𝘣𝘺𝘦ㅤ   ᗝ᳢    ::
          
      ✿ @user 𝖧𝖺 𝗌𝖺𝗅𝗂𝖽𝗈 𝖽𝖾𝗅 𝗀𝗋𝗎𝗉𝗈 *(𓏽̊◞ׄ ‸ ۪◟ּ𓏽 ᳹ )*
      ✐ @group  
         ︶⏝︶ ౨🩰ৎ ︶ׁ⏝︶

> *sᴇʀ-ʙᴏᴛ › https://serbot-akari.vercel.app/*`;

export default async (sock) => {
    sock.ev.on('group-participants.update', async (update) => {
        try {
            const { id: groupId, participants, action } = update;
            
            const primaryData = getPrimaryBot(groupId);
            const currentBotNumber = getBotNumber(sock);
            
            if (primaryData && primaryData.botNumber !== currentBotNumber) {
                return;
            }
            
            if (!primaryData) {
                return;
            }
            
            const metadata = await sock.groupMetadata(groupId).catch(() => null);
            if (!metadata) return;
            
            const memberCount = metadata.participants?.length || 0;
            const groupName = metadata.subject || 'Grupo';
            const groupDesc = metadata.desc || 'Sin descripción';
            const groupAdmins = getGroupAdmins(metadata.participants);
            
            const welcomeData = loadWelcome();
            const goodbyeData = loadGoodbye();
            const alertsData = loadAlerts();
            
            const config = loadConfig(sock);
            const bannerUrl = config.banner || 'https://files.catbox.moe/vtf23r.jpeg';
            
            const welcomeConfig = welcomeData[groupId] || { enabled: true };
            const goodbyeConfig = goodbyeData[groupId] || { enabled: true };
            const alertsEnabled = alertsData[groupId] !== false;
            
            const now = new Date();
            const fecha = now.toLocaleDateString('es-ES', { 
                day: '2-digit', 
                month: 'long', 
                year: 'numeric' 
            });
            const hora = now.toLocaleTimeString('es-ES', { 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit'
            });
            const tiempo = `${fecha} ${hora}`;
            
            const participantsList = Array.isArray(participants) ? participants : [participants];
            
            for (const participant of participantsList) {
                let jid = '';
                if (typeof participant === 'string') {
                    jid = participant;
                } else if (typeof participant === 'object') {
                    jid = participant.id || participant.jid || participant.phoneNumber || '';
                }
                
                if (!jid) continue;
                
                const number = cleanNumber(jid);
                if (!number) continue;
                
                const name = await getDisplayName(number) || number;
                
                if ((action === 'add') && welcomeConfig.enabled) {
                    let welcomeMsg = DEFAULT_WELCOME;
                    
                    if (welcomeData[groupId] && welcomeData[groupId].message) {
                        welcomeMsg = welcomeData[groupId].message;
                    }
                    
                    welcomeMsg = welcomeMsg
                        .replace(/@user/g, `@${number}`)
                        .replace(/@group/g, groupName)
                        .replace(/@desc/g, groupDesc)
                        .replace(/@members/g, memberCount)
                        .replace(/@time/g, tiempo);
                    
                    try {
                        const uploadMethod = sock.waUploadToServer || sock.updateMediaMessage;
                        
                        if (bannerUrl && uploadMethod) {
                            try {
                                const { imageMessage } = await prepareWAMessageMedia(
                                    { image: { url: bannerUrl } },
                                    { 
                                        upload: uploadMethod, 
                                        mediaTypeOverride: 'thumbnail-link' 
                                    }
                                );
                                
                                const linkPreview = {
                                    'canonical-url': LINK_FIJO,
                                    'matched-text': LINK_FIJO,
                                    title: config.nombre || 'Akari Bot',
                                    description: `🌻 Bienvenida a ${groupName}`,
                                    jpegThumbnail: imageMessage?.jpegThumbnail ? Buffer.from(imageMessage.jpegThumbnail) : undefined,
                                    highQualityThumbnail: imageMessage || undefined
                                };
                                
                                await sock.sendMessage(groupId, {
                                    text: welcomeMsg,
                                    linkPreview: linkPreview,
                                    contextInfo: {
                                        mentionedJid: [jid],
                                        isForwarded: true,
                                        forwardedNewsletterMessageInfo: {
                                            newsletterJid: config.canalId || '',
                                            serverMessageId: '0',
                                            newsletterName: config.canalNombre || ''
                                        }
                                    }
                                });
                            } catch (error) {
                                console.error('Error enviando bienvenida con banner:', error);
                                await sock.sendMessage(groupId, {
                                    text: welcomeMsg,
                                    contextInfo: {
                                        mentionedJid: [jid],
                                        isForwarded: true,
                                        forwardedNewsletterMessageInfo: {
                                            newsletterJid: config.canalId || '',
                                            serverMessageId: '0',
                                            newsletterName: config.canalNombre || ''
                                        }
                                    }
                                });
                            }
                        } else {
                            await sock.sendMessage(groupId, {
                                text: welcomeMsg,
                                contextInfo: {
                                    mentionedJid: [jid],
                                    isForwarded: true,
                                    forwardedNewsletterMessageInfo: {
                                        newsletterJid: config.canalId || '',
                                        serverMessageId: '0',
                                        newsletterName: config.canalNombre || ''
                                    }
                                }
                            });
                        }
                    } catch (error) {
                        console.error('Error enviando bienvenida:', error);
                        await sock.sendMessage(groupId, {
                            text: welcomeMsg,
                            contextInfo: {
                                mentionedJid: [jid],
                                isForwarded: true,
                                forwardedNewsletterMessageInfo: {
                                    newsletterJid: config.canalId || '',
                                    serverMessageId: '0',
                                    newsletterName: config.canalNombre || ''
                                }
                            }
                        });
                    }
                }
                
                if ((action === 'remove' || action === 'leave') && goodbyeConfig.enabled) {
                    let goodbyeMsg = DEFAULT_GOODBYE;
                    
                    if (goodbyeData[groupId] && goodbyeData[groupId].message) {
                        goodbyeMsg = goodbyeData[groupId].message;
                    }
                    
                    goodbyeMsg = goodbyeMsg
                        .replace(/@user/g, `@${number}`)
                        .replace(/@group/g, groupName)
                        .replace(/@desc/g, groupDesc)
                        .replace(/@members/g, memberCount)
                        .replace(/@time/g, tiempo);
                    
                    try {
                        const uploadMethod = sock.waUploadToServer || sock.updateMediaMessage;
                        
                        if (bannerUrl && uploadMethod) {
                            try {
                                const { imageMessage } = await prepareWAMessageMedia(
                                    { image: { url: bannerUrl } },
                                    { 
                                        upload: uploadMethod, 
                                        mediaTypeOverride: 'thumbnail-link' 
                                    }
                                );
                                
                                const linkPreview = {
                                    'canonical-url': LINK_FIJO,
                                    'matched-text': LINK_FIJO,
                                    title: config.nombre || 'Akari Bot',
                                    description: `🐝 Despedida de ${groupName}`,
                                    jpegThumbnail: imageMessage?.jpegThumbnail ? Buffer.from(imageMessage.jpegThumbnail) : undefined,
                                    highQualityThumbnail: imageMessage || undefined
                                };
                                
                                await sock.sendMessage(groupId, {
                                    text: goodbyeMsg,
                                    linkPreview: linkPreview,
                                    contextInfo: {
                                        mentionedJid: [jid],
                                        isForwarded: true,
                                        forwardedNewsletterMessageInfo: {
                                            newsletterJid: config.canalId || '',
                                            serverMessageId: '0',
                                            newsletterName: config.canalNombre || ''
                                        }
                                    }
                                });
                            } catch (error) {
                                console.error('Error enviando despedida con banner:', error);
                                await sock.sendMessage(groupId, {
                                    text: goodbyeMsg,
                                    contextInfo: {
                                        mentionedJid: [jid],
                                        isForwarded: true,
                                        forwardedNewsletterMessageInfo: {
                                            newsletterJid: config.canalId || '',
                                            serverMessageId: '0',
                                            newsletterName: config.canalNombre || ''
                                        }
                                    }
                                });
                            }
                        } else {
                            await sock.sendMessage(groupId, {
                                text: goodbyeMsg,
                                contextInfo: {
                                    mentionedJid: [jid],
                                    isForwarded: true,
                                    forwardedNewsletterMessageInfo: {
                                        newsletterJid: config.canalId || '',
                                        serverMessageId: '0',
                                        newsletterName: config.canalNombre || ''
                                    }
                                }
                            });
                        }
                    } catch (error) {
                        console.error('Error enviando despedida:', error);
                        await sock.sendMessage(groupId, {
                            text: goodbyeMsg,
                            contextInfo: {
                                mentionedJid: [jid],
                                isForwarded: true,
                                forwardedNewsletterMessageInfo: {
                                    newsletterJid: config.canalId || '',
                                    serverMessageId: '0',
                                    newsletterName: config.canalNombre || ''
                                }
                            }
                        });
                    }
                }
                
                if (alertsEnabled && primaryData && primaryData.botNumber === currentBotNumber) {
                    const authorJid = update.author || '';
                    const authorNumber = cleanNumber(authorJid);
                    
                    let alertText = '';
                    let mentions = [];
                    
                    if (action === 'promote') {
                        alertText = `「✎」 *@${number}* ha sido promovido a Administrador por *@${authorNumber}*.`;
                        mentions = [jid, authorJid, ...groupAdmins];
                    } else if (action === 'demote') {
                        alertText = `「✎」 *@${number}* ha sido degradado de Administrador por *@${authorNumber}*.`;
                        mentions = [jid, authorJid, ...groupAdmins];
                    }
                    
                    if (alertText) {
                        await sock.sendMessage(groupId, {
                            text: alertText,
                            contextInfo: {
                                mentionedJid: mentions,
                                isForwarded: true,
                                forwardedNewsletterMessageInfo: {
                                    newsletterJid: config.canalId || '',
                                    serverMessageId: '0',
                                    newsletterName: config.canalNombre || ''
                                }
                            }
                        });
                    }
                }
            }
            
        } catch (error) {
            console.error('❌ Error en evento group-participants:', error);
        }
    });
};
