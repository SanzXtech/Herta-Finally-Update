import { jadwalsholat } from '@bochilteam/scraper';

let handler = async (m, { text, usedPrefix, command }) => {
    if (!text) throw `Gunakan contoh ${usedPrefix}${command} semarang`;

    let res;
    try {
        res = await jadwalsholat(text);
    } catch (e) {
        throw `Gagal mendapatkan jadwal sholat untuk daerah *${text}*. Pastikan nama daerah yang Anda masukkan sudah benar.`;
    }

    if (!res || !res.today || Object.keys(res.today).length === 0) {
        throw `Jadwal sholat untuk daerah *${text}* tidak ditemukan. Pastikan nama daerah yang Anda masukkan sudah benar.`;
    }

    m.reply(`
Jadwal Sholat *${text}*

${Object.entries(res.today).map(([name, data]) => `*Sholat ${name}:* ${data}`).join('\n').trim()}
`.trim());
}

handler.help = ['salat <daerah>'];
handler.tags = ['quran'];
handler.command = /^(jadwal)?s(a|o|ha|ho)lat$/i;

export default handler;