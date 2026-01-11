let badwordRegex = /anj(k|g)|ajn?(g|k)|a?njin(g|k)|bajingan|b(a?n)?gsa?t|ko?nto?l|me?me?(k|q)|pe?pe?(k|q)|meki|titi(t|d)|pe?ler|tetek|toket|ngewe|go?blo?k|to?lo?l|idiot|(k|ng)e?nto?(t|d)|jembut|bego|dajj?al|janc(u|o)k|pantek|puki ?(mak)?|kimak|kampang|lonte|col(i|mek?)|pelacur|henceu?t|nigga|fuck|dick|bitch|tits|bastard|asshole/i;

let handler = (m) => m;

handler.before = async function (m) {
    if (!m.isGroup) return; // Pastikan pesan berasal dari grup
    const chat = db.data.chats[m.chat];
    
    // Cek apakah fitur antibadword aktif
    if (!chat || !chat.antibadword) return;

    let user = db.data.users[m.sender];
    if (!user.warning) user.warning = 0; // Pastikan properti warning ada

    let isBadword = badwordRegex.exec(m.text);
    if (isBadword) {
        user.warning += 1;

        // Beri peringatan kepada pengguna
        m.reply(`${user.warning >= 5 ? '*📮 Warning Kamu Sudah Mencapai 5 Maka Kamu Akan Dikick!*' : '*📮 Kata Kata Toxic Terdeteksi*'}

あ Warning: ${user.warning} / 5

[❗] Jika warning mencapai 5 Kamu akan dikeluarkan dari group

“Barang siapa yang beriman kepada Allah dan Hari Akhir maka hendaklah dia berkata baik atau diam” (HR. al-Bukhari dan Muslim).

ketik .antibadword off untuk menonaktifkan fitur`);

        // Kick pengguna jika warning mencapai 5
        if (user.warning >= 5) {
            user.warning = 0; // Reset warning setelah kick
            if (m.isBotAdmin) {
                await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
            } else {
                m.reply('⚠️ Bot bukan admin, tidak bisa mengeluarkan pengguna.');
            }
        }
    }
};

export default handler;
