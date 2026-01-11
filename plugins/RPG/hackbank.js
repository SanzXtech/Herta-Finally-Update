let handler = async (m, { conn, text, usedPrefix, command }) => {
  let dapat = Math.floor(Math.random() * 100000);
  let nomors = m.sender;
  let who;
  if (m.isGroup) who = m.mentionedJid[0];
  else who = m.chat;
  if (!who) return m.reply("⚠️ Targetkan seseorang untuk melancarkan aksi hack bank ini!");
  if (typeof db.data.users[who] == "undefined")
    return m.reply("❗ Pengguna tersebut tidak ditemukan dalam database kami!");

  let users = global.db.data.users;
  let userLevel = users[m.sender].level;
  let targetLevel = users[who].level;

  // Cek level perampok dan target
  if (userLevel < targetLevel) {
    return m.reply(`🚧 Kamu perlu level yang lebih tinggi untuk menembus keamanan @${who.split('@')[0]}!`, null, {
      mentions: [who]
    });
  }

  // Cek keamanan bank target
  if (users[who].robo >= 10) {
    return m.reply("🛡️ Bank target terlalu aman! Tingkat keamanannya tidak bisa ditembus!");
  }

  let __timers = new Date() - users[m.sender].lasthackbank;
  let _timers = 3600000 - __timers;
  let timers = clockString(_timers);

  if (new Date() - users[m.sender].lasthackbank > 3600000) {
    if (10000 > users[who].bank)
      return m.reply("🏦 Target tidak memiliki saldo yang cukup untuk diretas!");

    // Pajak berdasarkan keamanan (jumlah robo)
    let pajak = users[who].robo * 0.02;  // Pajak 2% per satu robo
    let jumlahSetelahPajak = Math.floor(dapat * (1 - pajak));
    
    // Transaksi hack bank
    users[who].bank -= jumlahSetelahPajak;
    users[m.sender].bank += jumlahSetelahPajak;
    users[m.sender].lasthackbank = new Date() * 1;

    conn.reply(m.chat, `🧑🏻‍💻 *Misi Berhasil!* Kamu berhasil mengakses rekening target dan menyedot dana sebesar *Rp.${jumlahSetelahPajak.toLocaleString()}*! 🕶️💻`, m);
  } else {
    conn.reply(
      m.chat,
      `⏳ Operasi gagal! Kamu baru saja melakukan hack. Tunggu *${timers}* sebelum mencoba lagi!`,
      m
    );
  }
};

handler.help = ["hackbank *@tag*"];
handler.tags = ["rpg"];
handler.command = /^hackbank$/;
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
