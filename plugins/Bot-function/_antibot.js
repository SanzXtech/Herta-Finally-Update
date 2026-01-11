let handler = (m) => m;

handler.before = async function (m, { conn }) {
  const isAntiBot = m.isGroup ? db.data.chats[m.chat].antiBot : false;

  if (m.isGroup && isAntiBot && m.isBaileys && !m.fromMe) {
    // Notifikasi awal saat bot terdeteksi
    await conn.reply(m.chat, `🚨 *Bot lain terdeteksi!* 🚨\n👤 Pengguna: @${m.sender.split('@')[0]}`, m, {
      mentions: [m.sender],
    });

    await sleep(1500);

    if (m.isBotAdmin) {
      // Hapus pesan bot lain (tanpa notifikasi jika gagal)
      try {
        await conn.sendMessage(m.chat, {
          delete: {
            remoteJid: m.chat,
            fromMe: false,
            id: m.id,
            participant: m.sender,
          },
        });
      } catch {}

      // Keluarkan bot yang terdeteksi (tanpa notifikasi jika gagal)
      try {
        await conn.groupParticipantsUpdate(m.chat, [m.sender], "remove");
      } catch {}
    }
  }
};

export default handler;
