let handler = async (m, { conn, args, isAdmin, isBotAdmin }) => {
  if (!m.isGroup) return m.reply("❌ Fitur ini hanya bisa digunakan di grup.");
  if (!isAdmin) return m.reply("❌ Hanya admin grup yang dapat mengatur fitur ini.");
  if (!isBotAdmin && !isOwner) return m.reply("❌ Bot harus menjadi admin untuk mengatur fitur ini.");

  if (!global.db.data.chats) global.db.data.chats = {};
  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = { autoLevelUp: true };

  const chat = global.db.data.chats[m.chat];

  if (args[0] === "on" || args[0] === "enable" || args[0] === "1") {
    if (chat.autoLevelUp) return m.reply("✅ Fitur *Auto Levelup* sudah aktif.");
    chat.autoLevelUp = true;
    return m.reply("✅ Fitur *Auto Levelup* telah diaktifkan.");
  } else if (args[0] === "off" || args[0] === "disable" || args[0] === "0") {
    if (!chat.autoLevelUp) return m.reply("❌ Fitur auto-level-up sudah nonaktif.");
    chat.autoLevelUp = false;
    return m.reply("❌ Fitur *Auto Levelup* telah dinonaktifkan.");
  } else {
    return m.reply("🚩 Gunakan perintah `.autolevelup on` atau `.autolevelup off` untuk mengatur fitur ini.");
  }
};

handler.help = ["autolevelup"];
handler.tags = ["group"];
handler.command = ["autolevelup"];
handler.group = true;
handler.admin = true;

export default handler;
