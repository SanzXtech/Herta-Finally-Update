let handler = async (
  m,
  { conn, q, args, isOwner, setReply, text, command, usedPrefix }
) => {
  if (!db.data.chats[m.chat]) db.data.chats[m.chat] = {}; // Ensure chat data exists
  const isAntiMedia = m.isGroup ? db.data.chats[m.chat].antimedia : false;

  if (!m.isAdmin) return setReply("Fitur ini hanya dapat diatur oleh admin grup.");
  if (!m.isGroup) return setReply("Fitur ini hanya dapat digunakan di grup.");

  if (args[0] === "on" || args[0] === "enable" || args[0] === "1") {
    if (isAntiMedia) return setReply("AntiMedia V1 sudah aktif.");
    db.data.chats[m.chat].antimedia = true;
    setReply("AntiMedia V1 telah diaktifkan.");
  } else if (args[0] === "off" || args[0] === "disable" || args[0] === "0") {
    if (!isAntiMedia) return setReply("AntiMedia V1 sudah nonaktif.");
    db.data.chats[m.chat].antimedia = false;
    setReply("AntiMedia V1 telah dinonaktifkan.");
  } else {
    setReply(`
Pilih on atau off.
*Contoh:* ${usedPrefix + command} on
    `);
  }
};
handler.help = ["antimedia"];
handler.tags = ["group"];
handler.command = ["antimedia"];
handler.group = true;
handler.admin = true;
export default handler;
