import fetch from 'node-fetch';

const handler = async (m, { conn, text, command, sender }) => {
  if (!m.isCreator) return m.reply(global.mess.owner);
  if (!text) {
    return m.reply(`📌 *Masukkan teks yang ingin dikirim ke channel!*\n\nContoh:\n.${command} Halo semua selamat malam~`);
  }

  try {
    const profilePicture = await conn.profilePictureUrl(sender, 'image').catch(_ => 'https://files.catbox.moe/zn9aza.jpg');
    const namaPengirim = conn.getName(sender);

    const content = {
      text,
      contextInfo: {
        externalAdReply: {
          title: namaPengirim,
          body: '',
          thumbnailUrl: profilePicture,
          sourceUrl: '',
          mediaType: 1,
          renderLargerThumbnail: false,
          showAdAttribution: true
        }
      }
    };

    await conn.sendMessage(global.newsletterJid, content);
    await m.reply(`✅ *Pesan berhasil dikirim ke Channel!*\n\n📝 Isi: ${text}`);
  } catch (err) {
    console.error(err);
    m.reply(`❌ Gagal mengirim pesan ke Channel!\n\n${err.message}`);
  }
};

handler.command = ['cch', 'chatch'];
handler.help = ['cch <teks>', 'chatch <teks>'];
handler.tags = ['owner'];
handler.owner = true;

export default handler;