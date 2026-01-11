import { promises as fsPromises } from "fs";
import { createHash } from "crypto";
import fetch from "node-fetch";

let Reg = /\|?(.*)([.|] *?)([0-9]*)$/i;

const handler = async (m, { conn, text, usedPrefix, command }) => {
  let user = global.db.data.users[m.sender];
  let now = +new Date();
  let cooldown = 24 * 60 * 60 * 1000; // 24 jam dalam milidetik

  // Cek apakah pengguna sudah terdaftar
  if (user.registered) {
    return m.reply(`[💬] Kamu sudah terdaftar\nMau daftar ulang? *${usedPrefix}unreg*`);
  }

  // Cek cooldown jika pengguna pernah unregister
  if (user.lastUnreg && now - user.lastUnreg < cooldown) {
    let sisaWaktu = cooldown - (now - user.lastUnreg);
    let jam = Math.floor(sisaWaktu / (60 * 60 * 1000));
    let menit = Math.floor((sisaWaktu % (60 * 60 * 1000)) / (60 * 1000));
    return m.reply(`🚫 Kamu harus menunggu ${jam} jam ${menit} menit sebelum bisa daftar lagi!`);
  }

  const pp = await conn.profilePictureUrl(m.sender, "image").catch((_) => "https://telegra.ph/file/ee60957d56941b8fdd221.jpg");
  const umurRandom = Math.floor(Math.random() * 100) + 1;
  
  const formatSalah = `⚠️ ɴᴀᴍᴀ ᴅᴀɴ ᴜᴍᴜʀ ᴛɪᴅᴀᴋ ʙᴏʟᴇʜ ᴋᴏsᴏɴɢ\nᴋᴇᴛɪᴋ : *${usedPrefix + command} nama.umur*\n📌Contoh : *${usedPrefix + command}* Sanz.${umurRandom}`;

  if (!Reg.test(text)) return m.reply(formatSalah);

  let [_, name, splitter, age] = text.match(Reg);
  if (!name) return m.reply("Nama tidak boleh kosong (Alphanumeric)");
  if (!age) return m.reply("Umur tidak boleh kosong (Angka)");

  age = parseInt(age);
  if (age > 40) return m.reply("*Gak boleh!*,\nTᴜᴀ Bᴀɴɢᴋᴀ Mᴀᴛɪ ᴀᴊᴀ Kᴏɴᴛᴏʟ");
  if (age < 5) return m.reply("*Gak boleh!*,\nBanyak pedo 🗿");

  if (user.name && user.name.trim() === name.trim())
    return m.reply("Nama sudah dipakai");

  user.name = name.trim();
  user.age = age;
  user.regTime = now;
  user.registered = true;
  user.lastUnreg = 0; // Reset cooldown saat daftar baru

  // Menggunakan transformText untuk memodifikasi teks
  const cap = transformText(`
*VERIFIKASI BERHASIL*

• *Nama :* ${name}
• *Umur :* ${age} tahun

Terima kasih telah melakukan verifikasi. Data pengguna telah disimpan dengan aman di database bot. Data kamu sekarang sudah terverifikasi.

🚀 Sekarang kamu dapat menggunakan fitur-fitur khusus yang hanya tersedia untuk pengguna terverifikasi.
Jangan lupa untuk membaca rules terlebih dahulu
`);

  // Mengirimkan pesan dengan foto profil
  let contextInfo = {
    externalAdReply: {
      showAdAttribution: false,
      title: "Verifikasi Sukses",
      mediaType: 1,
      renderLargerThumbnail: true,
      thumbnailUrl: pp, // Menggunakan foto profil yang diambil
    },
  };

  conn.sendMessage(m.chat, { contextInfo, text: cap }, { quoted: m });
};

handler.help = ["daftar", "register"].map((v) => v + " <nama>.<umur>");
handler.tags = ["xp"];
handler.command = /^(register|daftar)$/i;

export default handler;
