import fs from 'fs';
import path from 'path';

const airdrops = [
    { type: 'Common', limit: 1, money: 50_000, potion: 5, weight: 50 },
    { type: 'Uncommon', limit: 5, money: 100_000, potion: 10, weight: 30 },
    { type: 'Rare', limit: 15, money: 500_000, potion: 30, weight: 15 },
    { type: 'Epic', limit: 25, money: 1_000_000, potion: 50, weight: 4 },
    { type: 'Legendary', limit: 100, money: 2_000_000, potion: 75, weight: 1 },
    { type: 'Special', limit: 120, money: 3_000_000, potion: 100, weight: 0.5 },
    { type: 'Mythic', limit: 1000, money: 5_000_000, potion: 1000, weight: 0.1 },
];

const millisecondsPerDay = 15 * 60 * 1000; // 15 minutes

let handler = async (m, { conn }) => {
    const user = global.db.data.users[m.sender];
    if (!user) return m.reply('Pengguna tidak ditemukan di database.');

    const now = Date.now();
    if (user.lastAirdrop && (now - user.lastAirdrop) < millisecondsPerDay) {
        const wait = millisecondsPerDay - (now - user.lastAirdrop);
        const min = Math.floor(wait / 60000);
        const sec = Math.floor((wait % 60000) / 1000);
        return m.reply(`Kamu sudah mengambil airdrop. Tunggu ${min}m ${sec}s lagi.`);
    }

    const airdrop = getRandomAirdrop();
    user.limit = (user.limit || 0) + airdrop.limit;
    user.money = (user.money || 0) + airdrop.money;
    user.potion = (user.potion || 0) + airdrop.potion;
    user.lastAirdrop = now;

    const msg = `🎁 *Airdrop ${airdrop.type}* telah kamu buka!

📦 Kamu mendapatkan:
• 💰 *Money:* ${airdrop.money.toLocaleString()}
• ✨ *Limit:* ${airdrop.limit.toLocaleString()}
• 🧪 *Potion:* ${airdrop.potion.toLocaleString()}

📅 Ambil lagi setelah 15 menit.`;

    // gunakan package.json sebagai file dummy pdf
    const filePath = path.resolve('./package.json');
    const buffer = fs.readFileSync(filePath);

    await conn.sendMessage(m.chat, {
        document: buffer,
        fileName: 'Powered By Sanz Verse',
        mimetype: 'application/pdf',
        caption: msg,
        contextInfo: {
            externalAdReply: {
                title: "🎁 Airdrop Reward",
                mediaType: 1,
                renderLargerThumbnail: true,
                thumbnailUrl: 'https://pomf2.lain.la/f/eu8c2dkw.jpg',
                sourceUrl: 'https://example.com', // optional link
            }
        }
    }, { quoted: fkontak });
};

handler.command = /^airdrop$/i;
handler.tags = ['rpg'];
handler.help = ['airdrop'];
handler.register = true;
handler.group = true;
handler.premium = true;
handler.rpg = true;

function getRandomAirdrop() {
    const totalWeight = airdrops.reduce((sum, drop) => sum + drop.weight, 0);
    let rand = Math.random() * totalWeight;
    for (let drop of airdrops) {
        if (rand < drop.weight) return drop;
        rand -= drop.weight;
    }
    return airdrops[0]; // fallback
}

export default handler;