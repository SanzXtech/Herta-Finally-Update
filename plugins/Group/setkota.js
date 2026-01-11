import fetch from "node-fetch";

let handler = async (m, { args, isAdmin, chat }) => {
    if (!m.isGroup) return m.reply("❌ Fitur ini hanya bisa digunakan di grup.");
    if (!isAdmin) return m.reply("⚠️ Hanya admin yang bisa mengatur kota untuk jadwal salat.");

    let city = args.join(" ").toLowerCase(); // Ubah input menjadi lowercase
    if (!city) return m.reply("⚠️ Format salah!\nGunakan: *.setkota <nama kota>*\nContoh: *.setkota bandung*");

    // Cek validasi kota pada API aladhan
    try {
        let response = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=Indonesia&method=8`);
        let json = await response.json();

        // Jika API mengembalikan error atau kota tidak valid
        if (!json || json.code !== 200 || !json.data || !json.data.timings) {
            return m.reply("❌ Kota tidak ditemukan! Pastikan nama kota benar dan coba lagi.");
        }

        // Simpan kota ke database hanya jika valid
        global.db.data.chats[chat] = global.db.data.chats[chat] || {};
        global.db.data.chats[chat].city = city;

        m.reply(`✅ Kota untuk jadwal salat grup ini telah diubah ke *${city}*.\n🔄 Jadwal akan diperbarui sesuai waktu setempat.`);
    } catch (error) {
        m.reply("⚠️ Terjadi kesalahan saat mengambil data kota. Coba lagi nanti.");
    }
};

handler.command = ["setkota"];
handler.help = ["setkota <nama kota>"];
handler.tags = ["group"];
handler.admin = true;

export default handler;