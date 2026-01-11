let handler = async (m, { conn, text, usedPrefix, command }) => {
  let dapat = Math.floor(Math.random() * 250000);
  let nomors = m.sender;
  let who;
  if (m.isGroup) who = m.mentionedJid[0];
  else who = m.chat;
  if (!who) return m.reply("⚠️ Targetkan seseorang untuk menjalankan aksi perampokan ini!");
  if (typeof db.data.users[who] == "undefined")
    return m.reply("❗ Pengguna tersebut tidak ditemukan dalam database kami!");

  let userLevel = global.db.data.users[m.sender].level;
  let targetLevel = global.db.data.users[who].level;

  // Cek level perampok dan target
  if (userLevel < targetLevel) {
    return m.reply(`🚧 Level kamu belum cukup untuk menaklukkan @${who.split('@')[0]}! Tingkatkan kekuatanmu terlebih dahulu!`, null, {
      mentions: [who]
    });
  }

  let __timers = new Date() - global.db.data.users[m.sender].lastrampok;
  let _timers = 3600000 - __timers;
  let timers = clockString(_timers);
  let users = global.db.data.users;

  if (new Date() - global.db.data.users[m.sender].lastrampok > 3600000) {
    if (10000 > users[who].money)
      return m.reply("💵 Target tidak punya uang yang cukup untuk dirampok!");

    // Transaksi perampokan
    users[who].money -= dapat;
    users[m.sender].money += dapat;
    global.db.data.users[m.sender].lastrampok = new Date() * 1;

    conn.reply(m.chat, `🥷🏻 *Sukses!* Kamu berhasil merampok target dan mendapatkan uang sebesar *Rp.${dapat.toLocaleString()}* dari kantongnya! 🕶️`, m);
  } else {
    conn.reply(
      m.chat,
      `⏳ Kamu baru saja melakukan perampokan! Tunggu *${timers}* untuk merencanakan aksi selanjutnya.`,
      m
    );
  }
};

handler.help = ["merampok *@tag*"];
handler.tags = ["rpg"];
handler.command = /^merampok$/;
handler.register = true;
handler.group = true;
handler.rpg = true;
export default handler;

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function clockString(ms) {
  let h = Math.floor(ms / 3600000);
  let m = Math.floor(ms / 60000) % 60;
  let s = Math.floor(ms / 1000) % 60;
  return [h, m, s].map((v) => v.toString().padStart(2, 0)).join(":");
}
