import { promises as fsPromises } from "fs";
import { createHash } from "crypto";
import fetch from "node-fetch";
import canvafy from "canvafy"; // Perbaikan impor modul CommonJS

const { Captcha, Util } = canvafy; // Destructuring objek dari default export

let Reg = /\|?(.*)([.|] *?)([0-9]*)$/i;
let activeSessions = {}; // Untuk menyimpan sesi verifikasi aktif

const handler = async (m, { conn, text, usedPrefix, command, isPremium }) => {
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

  // Cek apakah ada sesi aktif
  if (activeSessions[m.sender]) {
    return m.reply("🚫 Kamu sudah memiliki sesi verifikasi yang aktif. Selesaikan sesi sebelumnya terlebih dahulu.");
  }

  // Generate captcha
  const backgroundPath = "./media/background.jpg";
  const captchaKey = Util.captchaKey(5); // Panjang kunci captcha diubah menjadi 5 karakter
  const captcha = await new Captcha()
    .setBackground("image", backgroundPath)
    .setCaptchaKey(captchaKey)
    .setBorder("#f0f0f0")
    .setOverlayOpacity(0.7)
    .build();

  // Kirim captcha ke private chat
const caption = `🔒 *Kode Verifikasi*\n\nSalin kode berikut dan kirimkan kembali di ${isPremium ? "private chat ini" : "grup"}:\n\n*${captchaKey}*\n\nKode ini hanya berlaku selama 1 menit.`;
await conn.sendMessage(m.sender, { image: captcha, caption });

// Hanya balas di grup
if (m.isGroup) {
  m.reply(`✅ Kode verifikasi telah dikirim ke private chat Anda. Silakan kirim kode tersebut di ${isPremium ? "private chat" : "grup."} ini`);
}

  // Simpan sesi aktif
  activeSessions[m.sender] = {
    captchaKey,
    timeout: setTimeout(() => {
      delete activeSessions[m.sender];
      delete conn.chaptcha[m.sender];
      conn.sendMessage(isPremium ? m.sender : m.chat, { text: "⏳ Sesi verifikasi telah berakhir. Silakan coba lagi." });
    }, 60000), // 1 menit
  };

  // Simpan callback untuk memproses pesan pengguna
  conn.chaptcha = conn.chaptcha || {};
  conn.chaptcha[m.sender] = async (msg) => {
    if (!msg.message || msg.key.remoteJid !== (isPremium ? m.sender : m.chat) || !activeSessions[m.sender]) return;

    let input = msg.message.conversation || "";
    if (input.trim() === activeSessions[m.sender].captchaKey) {
      clearTimeout(activeSessions[m.sender].timeout);
      delete activeSessions[m.sender];
      delete conn.chaptcha[m.sender];

      // Generate nama dan umur
      let name = m.pushName || "User";
      let age = Math.floor(Math.random() * 36) + 5; // Umur antara 5-40

      // Simpan data user
      user.name = name;
      user.age = age;
      user.regTime = now;
      user.registered = true;

      conn.sendMessage(isPremium ? m.sender : m.chat, {
        text: `✅ *Verifikasi Berhasil*\n\n• *Nama:* ${name}\n• *Umur:* ${age} tahun\n\nSelamat! Kamu sekarang terdaftar.`,
      });
    } else {
      conn.sendMessage(isPremium ? m.sender : m.chat, { text: "❌ Kode yang kamu masukkan salah. Silakan coba lagi." });
    }
  };
};

// Tambahkan event listener untuk memproses pesan baru
handler.before = async (m) => {
  if (m.isBaileys || !m.text) return;

  for (let sender in conn.chaptcha) {
    let { captchaKey, timeout } = activeSessions[sender] || {};
    if (!captchaKey || m.sender !== sender) continue;

    let input = m.text.trim();
    if (input === captchaKey) {
      clearTimeout(timeout);
      delete activeSessions[sender];
      delete conn.chaptcha[sender];

      // Generate nama dan umur
      let user = global.db.data.users[m.sender];
      let name = m.pushName || "User";
      let age = Math.floor(Math.random() * 36) + 5; // Umur antara 5-40

      // Simpan data user
      user.name = name;
      user.age = age;
      user.regTime = +new Date();
      user.registered = true;

      await m.reply(`✅ *Verifikasi Berhasil*\n\n• *Nama:* ${name}\n• *Umur:* ${age} tahun\n\nSelamat! Kamu sekarang terdaftar.`);
    } else {
      await m.reply("❌ Kode yang kamu masukkan salah. Silakan coba lagi.");
    }
  }
};

handler.help = ["verify"];
handler.tags = ["xp"];
handler.command = /^(verify|verifikasi)$/i;

// Note: Event listener sudah di-handle oleh handler.before, tidak perlu registerListener
// untuk mencegah double processing

export default handler;
