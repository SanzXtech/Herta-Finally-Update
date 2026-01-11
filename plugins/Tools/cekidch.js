const handler = async (m, { text }) => {
    if (!text) return m.reply("❌ Harap masukkan link channel WhatsApp!");
    if (!text.includes("https://whatsapp.com/channel/")) return m.reply("⚠️ Link tautan tidak valid!");
 
    let result = text.split("https://whatsapp.com/channel/")[1];
    let res = await conn.newsletterMetadata("invite", result);
 
    let teks = `
*📌 ID:* ${res.id}
*📢 Nama:* ${res.name}
*👥 Total Pengikut:* ${res.subscribers}
*📌 Status:* ${res.state}
*✅ Verified:* ${res.verification == "VERIFIED" ? "Terverifikasi" : "Tidak"}
`;
 
    return m.reply(teks);
};
 
handler.command = ["cekidch", "idch"];
export default handler;