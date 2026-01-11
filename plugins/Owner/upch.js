import fs from 'fs';

let handler = async (m, { conn, text }) => {
    const idsaluran = "120363282851754043@newsletter";
    const thumbnail = fs.readFileSync('./media/alert.png');

    try {
        const quoted = m.quoted || m;
        const type = quoted.mtype || '';
        const mediaBuffer = await quoted.download?.();

        // 🔹 Jika hanya teks tanpa media & tanpa reply
        if (text && !m.quoted) {
            await conn.sendMessage(idsaluran, {
                text: text,
                contextInfo: {
                    externalAdReply: {
                        title: "📢 New Message !!!",
                        body: "Follow Saluran Ini Agar Tidak Ketinggalan Update Yaaww😘",
                        thumbnail: thumbnail,
                        sourceUrl: "https://sanzonly.id"
                    }
                }
            }, { quoted: m });

            return m.reply(`✅ Teks berhasil dikirim ke channel!`);
        }

        // 🔹 Tangani jika tidak ada teks atau media
        if (!text && !mediaBuffer) {
            return m.reply('❌ Harap kirim teks langsung atau balas media dengan caption.');
        }

        // 🔹 Ambil caption asli jika tidak ada teks tambahan
        let finalCaption = text || quoted.text || '';

        // 🔸 Penanganan Foto
        if (type.includes('imageMessage')) {
            await conn.sendMessage(idsaluran, {
                image: mediaBuffer,
                caption: finalCaption,
                contextInfo: {
                    externalAdReply: {
                        title: "📢 New Message !!!",
                        body: "Follow Saluran Ini Agar Tidak Ketinggalan Update Yaaww😘",
                        thumbnail: thumbnail,
                        sourceUrl: "https://sanzonly.id"
                    }
                }
            }, { quoted: m });

            return m.reply(`✅ FOTO berhasil dikirim ke channel!`);
        }

        // 🔸 Penanganan Video
        if (type.includes('videoMessage')) {
            await conn.sendMessage(idsaluran, {
                video: mediaBuffer,
                caption: finalCaption,
                contextInfo: {
                    externalAdReply: {
                        title: "📢 New Message !!!",
                        body: "Follow Saluran Ini Agar Tidak Ketinggalan Update Yaaww😘",
                        thumbnail: thumbnail,
                        sourceUrl: "https://sanzonly.id"
                    }
                }
            }, { quoted: m });

            return m.reply(`✅ VIDEO berhasil dikirim ke channel!`);
        }

        // 🔸 Penanganan Audio (tanpa contextInfo)
        if (type.includes('audioMessage')) {
            await conn.sendMessage(idsaluran, {
                audio: mediaBuffer,
                mimetype: 'audio/mp4',
                ptt: true
            }, { quoted: m });

            return m.reply(`✅ AUDIO berhasil dikirim ke channel!`);
        }

        // 🔸 Penanganan Sticker (tanpa contextInfo)
        if (type.includes('stickerMessage')) {
            await conn.sendMessage(idsaluran, {
                sticker: mediaBuffer
            }, { quoted: m });

            return m.reply(`✅ STICKER berhasil dikirim ke channel!`);
        }

        m.reply('❌ Tipe media tidak didukung! Hanya mendukung foto, video, audio, atau stiker.');
    } catch (err) {
        console.error(`❌ Error saat mengirim ke saluran: ${err.message}`);
        m.reply(`❌ Gagal mengirim pesan ke channel.`);
    }
};

handler.command = ['upch'];
handler.tags = ['tools'];
handler.help = ['upch'];
handler.owner = true;

export default handler;
