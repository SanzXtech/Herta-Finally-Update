import axios from 'axios';

async function spotidown(url) {
    try {
        const response = await axios.post('https://spotymate.com/api/download-track',
            { url: url },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36',
                    'Referer': 'https://spotymate.com/'
                }
            }
        );

        if (response.data && response.data.file_url) {
            return response.data.file_url;
        } else {
            return null;
        }
    } catch (error) {
        console.error(`❌ Error saat mengunduh lagu: ${error.message}`);
        return null;
    }
}

let handler = async (m, { conn, args }) => {
    if (!args[0]) return m.reply('❌ Masukkan link Spotify yang valid!');
    if (!/^https:\/\/open\.spotify\.com\//.test(args[0])) {
        return m.reply('⚠️ Link harus berasal dari Spotify!');
    }

    let url = args[0];

    m.reply('⏳ Sedang memproses, tunggu sebentar...');

    let result = await spotidown(url);

    if (!result) {
        return m.reply('❌ Gagal mendapatkan audio! Pastikan link benar dan coba lagi.');
    }

    await conn.sendMessage(m.chat, {
        audio: { url: result },
        mimetype: 'audio/mpeg',
        fileName: `Spotify_${Date.now()}.mp3`,
        caption: '✅ *Berhasil didownload!*'
    }, { quoted: m });
};

handler.command = /^spotify(dl|down|download)$/i;
handler.tags = ['downloader'];
handler.help = ['spotify <link>'];

export default handler;
