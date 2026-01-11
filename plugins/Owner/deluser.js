let handler = async (m, { text, isOwner }) => {
  const userTagOrNumber = text.trim().replace(/[@+\s-]/g, ""); // Menghapus '@', '+', spasi, dan tanda hubung

  // Jika owner tidak menyertakan tag atau nomor
  if (!userTagOrNumber) {
    if (!isOwner) {
      return m.reply("Perintah ini hanya bisa digunakan oleh owner.");
    }
    return m.reply("Silakan tag pengguna atau masukkan nomor yang ingin dihapus.");
  }

  // Mencari pengguna berdasarkan ID, tag, atau nomor telepon (dengan berbagai format)
  const userId = Object.keys(db.data.users).find((id) => {
    const formattedId = id.replace(/[@+\s-]/g, ""); // Hapus simbol pada ID pengguna
    return formattedId.includes(userTagOrNumber);
  });

  // Menghapus pengguna jika ditemukan
  if (userId) {
    delete db.data.users[userId];
    m.reply(`Pengguna @${userId.split("@")[0]} berhasil dihapus.`, null, {
      mentions: [`${userId}`]
    });
  } else {
    m.reply(`Pengguna dengan tag atau nomor ${userTagOrNumber} tidak ditemukan.`);
  }
};


handler.help = ['deluser'];
handler.tags = ['owner'];
handler.command = /^deluser$/i
handler.owner = true; // Hanya owner yang bisa menggunakan perintah ini

export default handler;
