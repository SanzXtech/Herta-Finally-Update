import ms from "parse-ms";

let handler = async (m, { conn, args, isPremium, isOwner, setReply }) => {
  let mentionByReply = m.mentionedJid && m.mentionedJid[0];
  let inputNumber = args[0] 
    ? args[0].replace(new RegExp("[()+-/ +]", "gi"), "") + `@s.whatsapp.net` 
    : m.sender;
  let nomernya = mentionByReply ? mentionByReply : inputNumber;

  let user = db.data.users[nomernya];
  if (!user) return setReply("🚫 Pengguna tidak ditemukan atau belum terdaftar.");
  
  if (!user.premium && !isOwner) return setReply(`❗ Pengguna ini bukan premium atau kamu bukan pemilik bot.`);

  if (user.premiumTime === Infinity) {
    // Jika pengguna memiliki premium unlimited
    let teks = `
––––––『 ✨ *USER PREMIUM* ✨ 』––––––

👤 *Name :* ${user.name || "Tidak terdaftar"}
📱 *Number:* ${nomernya.split("@")[0]}
⏳ *Days Left:* Unlimited ♾️
📅 *Countdown:* Unlimited ♾️
📆 *Time order:* ${user.timeOrder || "Tidak ada data"}
🛑 *Time end:* Unlimited ♾️

${copyright}
    `;
    return setReply(teks);
  }

  // Jika pengguna premium dengan masa aktif terbatas
  let cekvip = ms(user.premiumTime - Date.now());
  if (cekvip.days < 0 || user.premiumTime - Date.now() <= 0) {
    return setReply("⚠️ Bukan user premium");
  }

  let cekbulan = Math.floor(cekvip.days / 30);
  let premiumnya = `${cekbulan} Bulan 🗓️ ${cekvip.days - cekbulan * 30} Hari ⏳ ${cekvip.hours} Jam 🕰️ ${cekvip.minutes} Menit`;

  let teks = `
––––––『 ✨ *USER PREMIUM* ✨ 』––––––

👤 *Name :* ${user.name || "Tidak terdaftar"}
📱 *Number:* ${nomernya.split("@")[0]}
⏳ *Days Left:* ${premiumnya}
📅 *Countdown:* ${user.premiumTime - Date.now() > 0 ? `${user.premiumTime - Date.now()} ms` : "⏰ Premium telah habis"}
📆 *Time order:* ${user.timeOrder || "Tidak ada data"}
🛑 *Time end:* ${user.timeEnd || "Tidak ada data"}

${copyright}
  `;

  setReply(teks);
};

handler.help = ["cekprem"];
handler.tags = ["info"];
handler.command = /^(cekprem|cekpremium)$/i;

export default handler;
