let handler = async (m, { conn, args, isAdmin, isBotAdmin}) => {
    if (!isAdmin) return m.reply("Hanya admin yang dapat mengubah pengaturan ini.");
    if (!isBotAdmin && !isOwner) return m.reply("Saya harus menjadi admin untuk menjalankan fitur ini.");

    let chat = db.data.chats[m.chat];
    let status = args[0]?.toLowerCase();

    if (["on", "enable", "1"].includes(status)) {
        if (chat.antiBot) return m.reply("Fitur sudah aktif.");
        chat.antiBot = true;
        m.reply("✅ *AntiBot diaktifkan!* Semua bot selain saya akan dikeluarkan dari grup ini.");
    } else if (["off", "disable", "0"].includes(status)) {
        if (!chat.antiBot) return m.reply("Fitur sudah nonaktif.");
        chat.antiBot = false;
        m.reply("❌ *AntiBot dinonaktifkan!* Sekarang bot lain diperbolehkan masuk.");
    } else {
        m.reply("Gunakan: `.antibot on` untuk mengaktifkan atau `.antibot off` untuk menonaktifkan fitur.");
    }
};

handler.help = ["antibot"];
handler.tags = ["group"];
handler.command = ["antibot"];
handler.group = true;
handler.admin = true;

export default handler;