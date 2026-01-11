import canvafy from "canvafy";

let handler = async (m, { conn }) => {
  const user = global.db.data.users[m.sender];
  if (!user) {
    return conn.reply(m.chat, "❌ *Akun Anda tidak ditemukan di database.*", m);
  }

  const userLevel = user.level || 0;
  let userExp = user.exp || 0;

  let requiredExp = userLevel === 0 ? 500 : 1000 * userLevel; // EXP awal
  let totalBonus = 0; // Total uang bonus
  let newLevel = userLevel; // Level baru setelah loop

  // Perhitungan kenaikan level
  while (userExp >= requiredExp) {
    userExp -= requiredExp;
    newLevel++;
    totalBonus += 1000 * newLevel; // Bonus bertambah sesuai level
    requiredExp = 1000 * newLevel; // EXP untuk level berikutnya
  }

  // Jika level tidak berubah
  if (newLevel === userLevel) {
    const expLeft = requiredExp - userExp;
    const progressBar = generateProgressBar(userExp, requiredExp, 20);
    const percentage = ((userExp / requiredExp) * 100).toFixed(1);

    const responseText = `✨ *[ LEVELUP GAGAL ]* ✨\n
🌟 *Level Saat Ini:* ${userLevel}
🎖️ *Pangkat:* ${user.grade || "Pemula"}
📈 *EXP:* ${userExp} / ${requiredExp} (${percentage}%)
⏳ *Sisa EXP:* ${expLeft}
🔋 *Progress:* [${progressBar}]\n
💡 *Tips:*
🔹 Rajin bermain game untuk mendapatkan lebih banyak EXP!
🔹 Anda semakin dekat ke level *${userLevel + 1}*. Teruslah berjuang! 💪`;

    return conn.reply(m.chat, responseText, m);
  }

  // Update data pengguna
  user.exp = userExp;
  user.level = newLevel;
  user.money = (user.money || 0) + totalBonus;

  const { userLeveling } = await import("../../lib/user.js");
  user.grade = userLeveling(`${newLevel}`);

  // Generate gambar dengan Canvafy
  const nama = user.name || m.pushname || "Pengguna";
  const pp = await conn.profilePictureUrl(m.sender, "image").catch(() => null);

  let image;
  try {
    const backgroundPath = "./media/background.jpg";
    const avatarPath = "./media/levelup.jpg";

    image = await new canvafy.LevelUp()
      .setAvatar(pp || avatarPath) // Use local avatar path
      .setBackground("image", backgroundPath)
      .setUsername(nama)
      .setBorder("#000000")
      .setAvatarBorder("#6200ee")
      .setOverlayOpacity(0.7)
      .setLevels(userLevel, newLevel)
      .build();
  } catch (err) {
    console.error("Error creating Canvafy image:", err);
    return conn.reply(m.chat, "❌ *Gagal membuat gambar level up.*", m);
  }

  // Respons pesan
  const levelsGained = newLevel - userLevel;
  const text = `🎉 *[ LEVELUP BERHASIL ]* 🎉\n
✨ *Nama:* ${nama}
🎖️ *Pangkat:* ${user.grade}
⬆️ *Level Baru:* ${userLevel} ➠ ${newLevel}
💰 *Total Bonus:* Rp ${totalBonus.toLocaleString()}\n
🔥 *Selamat!* Anda berhasil naik ${levelsGained} level! 🎉`;

  await conn.sendMessage(m.chat, { image, caption: text });
};

// Fungsi untuk membuat progress bar
function generateProgressBar(current, total, size = 5) {
  const progress = Math.round((current / total) * size);
  const empty = size - progress;
  return "■".repeat(progress) + "□".repeat(empty);
}

handler.command = /^levelup$/i;
handler.rpg = true;
handler.register = true;
export default handler;
