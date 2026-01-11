let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!conn.trade) conn.trade = {}; // Inisialisasi sesi trade sementara
  
  let user = global.db.data.users[m.sender];
  let target =
    m.mentionedJid && m.mentionedJid[0]
      ? m.mentionedJid[0]
      : args[0]
      ? args[0].replace(/[@ .+-]/g, "") + "@s.whatsapp.net"
      : "";

  if (!target) return m.reply("Tag pengguna untuk trade!");
  if (!(target in global.db.data.users)) return m.reply(`Pengguna tidak ada di database`);
  if (conn.trade[m.sender] || conn.trade[target])
    return m.reply("Salah satu dari kalian sudah dalam sesi trade!");

  // Membuat sesi trade sementara
  conn.trade[m.sender] = target;
  conn.trade[target] = m.sender;

  m.reply(`Sesi trade dibuat antara kamu dan @${target.replace(/@s\.whatsapp\.net/g, "")}. Gunakan *${usedPrefix}tradeitem* untuk menawarkan item. Gunakan *${usedPrefix}cancel* untuk Membatalkan`, null, { mentions: [target] });
};

handler.before = async m => {
  if (m.isBaileys) return;
  if (!m.text) return;

  if (m.text.toLowerCase() === 'cancel' || m.text.toLowerCase() === 'batal') {
    if (conn.trade[m.sender]) {
      let target = conn.trade[m.sender];
      delete conn.trade[m.sender];
      delete conn.trade[target];
      m.reply('Sesi trade telah dibatalkan!');
    } else {
      m.reply('Kamu tidak sedang dalam sesi trade!');
    }
  }
};

handler.help = ["trade @tag"];
handler.tags = ["rpg"];
handler.command = /^(trade)$/i;
handler.group = true;
handler.rpg = true;
handler.register = true;
export default handler;
