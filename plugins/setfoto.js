export default {
    comando: 'setfoto',
    alias: ['setpp', 'setprofile'],
    category: 'owner',
    cooldown: 5,
    owner: true, 
    execute: async (sock, chat, m) => {
        try {
            const q = m.quoted ? m.quoted : m;
            const mime = (q.msg || q).mimetype || q.mtype || '';

            if (!/image/.test(mime)) {
                return sock.sendMessage(chat, { text: '❌ *Responde a una imagen con .setfoto*' }, { quoted: m });
            }

            await sock.sendMessage(chat, { text: '⏳ *Cambiando foto...*' }, { quoted: m });

            let media = await q.download?.() || await sock.downloadMediaMessage(q);
            let jid = sock.decodeJid ? sock.decodeJid(sock.user.id) : sock.user.id;

            await sock.updateProfilePicture(jid, media);
            
            return sock.sendMessage(chat, { text: '✅ *Foto cambiada con éxito*' }, { quoted: m });

        } catch (e) {
            console.log(e);
            return sock.sendMessage(chat, { text: `❌ Error: ${e.message}` }, { quoted: m });
        }
    }
}