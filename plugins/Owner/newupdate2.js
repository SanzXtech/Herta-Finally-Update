import fs from 'fs';

let handler = async (m, { conn, text }) => {
    const idsaluran = "120363282851754043@newsletter";
    const thumbnail = fs.readFileSync('./media/alert.png');

    try {
        const quoted = m.quoted || m;
        const type = quoted.mtype || '';
        const mediaBuffer = await quoted.download?.();

        // 🔹 Tangani jika tidak ada teks atau media
        if (!text && !mediaBuffer) {
            return m.reply('❌ Harap kirim teks langsung atau balas media dengan caption.');
        }

        // 🔹 Format pesan
        const [feature, note] = text.split('.').map(t => t.trim());
        if (!feature || !note) {
            return m.reply('❌ Format salah! Gunakan: .newupdate fitur.pesanupdate');
        }

        const messageText = `*• NEW UPDATE 📢*\n*🗃️Feature : ${feature}*\n*❗Note : ${note}*\n\nInfo Lengkap Disini\nhttps://whatsapp.com/channel/0029VafEhDUIXnlyGgMSgH2u`;

        // 🔸 Penanganan Foto
        if (type.includes('imageMessage')) {
            await conn.sendMessage(idsaluran, {
                image: mediaBuffer,
                caption: messageText,
                contextInfo: {
                    externalAdReply: {
                        title: "📢 NEW UPDATE !!!",
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
                caption: messageText,
                contextInfo: {
                    externalAdReply: {
                        title: "📢 New Update !!!",
                        body: "Follow Saluran Ini Agar Tidak Ketinggalan Update Yaaww😘",
                        thumbnail: thumbnail,
                        sourceUrl: "https://sanzonly.id"
                    }
                }
            }, { quoted: m });

            return m.reply(`✅ VIDEO berhasil dikirim ke channel!`);
        }

        // 🔹 Jika hanya teks tanpa media
        if (text && !m.quoted) {
            await conn.sendMessage(idsaluran, {
                text: messageText,
                contextInfo: {
                    externalAdReply: {
                        title: "📢 New Update !!!",
                        body: "Follow Saluran Ini Agar Tidak Ketinggalan Update Yaaww😘",
                        thumbnail: thumbnail,
                        sourceUrl: "https://sanzonly.id"
                    }
                }
            }, { quoted: m });

            return m.reply(`✅ Teks berhasil dikirim ke channel!`);
        }

        m.reply('❌ Tipe media tidak didukung! Hanya mendukung foto, video, atau teks.');
    } catch (err) {
        console.error(`❌ Error saat mengirim ke saluran: ${err.message}`);
        m.reply(`❌ Gagal mengirim pesan ke channel.`);
    }
};

handler.command = ['newupdate2'];
handler.tags = ['update'];
handler.help = ['newupdate2'];
handler.owner = true;

export default handler;
