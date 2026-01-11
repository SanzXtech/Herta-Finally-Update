import toMs from "ms";
import ms from "parse-ms";
import fs from "fs";

const CLAIM_LIMIT = 30; // Jumlah limit yang bisa diklaim
const RESET_TIME = '00:00'; // Waktu reset klaim harian

let handler = async (m, { conn, args, isPremium, isOwner, setReply }) => {
    const gcount = isPremium ? gcounti.prem : gcounti.user;
    let prefix = ".";
    let name = m.mentionByReply
        ? await conn.getName(m.mentionByReply)
        : m.pushname;
    let number = m.mentionByReply
        ? m.mentionByReply.split("@")[0]
        : m.senderNumber;

    let user = db.data.users[m.sender];
    let limid = isPremium
        ? "Unlimited"
        : `${user.limit}/${limitCount}`;
    let gemlimit = `${user.glimit}/${gcount}`;
    let uang = user.money.toLocaleString();

    // Waktu saat ini
    let now = new Date();
    let resetTime = new Date(now);
    resetTime.setHours(0, 0, 0, 0); // Atur waktu reset ke 00:00
let lastClaim = user.lastclaim || 0;

    // Periksa apakah sudah bisa klaim lagi
    let isClaimable = now - lastClaim >= 86400000; // 24 jam dalam milidetik

    let teks = `––––––『 *USER LIMIT* 』––––––
        
• Nama: ${name}
• Nomer: ${number}
• Limit : ${limid}
• Saldo : Rp ${uang}
        
Kamu dapat membeli limit dengan ${prefix}buy limit`;

    if (m.text.toLowerCase().includes('claimlimit')) {
        if (!isClaimable) {
            let remainingTime = ms(new Date().setHours(24, 0, 0, 0) - now.getTime());
            return setReply(`⏳ Anda sudah klaim hari ini.\nSilakan coba lagi dalam ${remainingTime.hours} jam ${remainingTime.minutes} menit.`);
        }

        let amount = CLAIM_LIMIT;
        if (user.premium) amount = Math.floor(amount * 1.5);
        user.limit += amount;
        user.lastclaim = now.getTime();

        teks = `🎯 *Berhasil klaim ${amount} limit!*\nKembali lagi besok pada pukul ${RESET_TIME} untuk klaim lagi.`;

        // Kirim tanpa tombol untuk hasil klaim
        return conn.sendMessage(m.chat, {
            document: fs.readFileSync("./package.json"),
            fileName: 'Create By SanzOnly',
            fileLength: "99999999999999",
            pageCount: 99999,
            caption: teks,
            mimetype: "application/pdf",
            contextInfo: {
                mentionedJid: [m.sender]
            }
        }, { quoted: m });
    } 

    // Tambahkan tombol hanya pada 'ceklimit'
    if (isClaimable) {
        teks += `\n\n🔹 *Anda bisa klaim ${CLAIM_LIMIT} limit hari ini!*`;
        conn.sendMessage(m.chat, {
            document: fs.readFileSync("./package.json"),
            fileName: 'Create By SanzOnly',
            fileLength: "99999999999999",
            pageCount: 99999,
            caption: teks,
            mimetype: "application/pdf",
            contextInfo: {
                mentionedJid: [m.sender]
            },
            buttons: [
                { buttonId: "!ceklimit claimlimit", buttonText: { displayText: "Klaim Limit 🎯" }, type: 1, viewOnce: true }
            ],
            headerType: 1,
            viewOnce: true
        }, { quoted: m });
    } else {
        let remainingTime = ms(resetTime.getTime() + 86400000 - now.getTime());
        teks += `\n\n⏳ *Kamu sudah klaim limit hari ini.*\nSilakan klaim lagi dalam ${remainingTime.hours} jam ${remainingTime.minutes} menit.`;

        // Kirim tanpa tombol untuk hasil klaim yang gagal
        conn.sendMessage(m.chat, {
            document: fs.readFileSync("./package.json"),
            fileName: 'Create By SanzOnly',
            fileLength: "99999999999999",
            pageCount: 99999,
            caption: teks,
            mimetype: "application/pdf",
            contextInfo: {
                mentionedJid: [m.sender]
            }
        }, { quoted: m });
    }
};

handler.command = ["ceklimit", "limit"];
handler.tags = ["info"];
handler.help = ["ceklimit", "limit"];

export default handler;
