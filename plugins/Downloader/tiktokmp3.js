import got from 'got';
import cheerio from 'cheerio';
import axios from 'axios';

let handler = async (m, { conn, text, args, usedPrefix, command }) => {
    let input = `[!] *wrong input*
    
    Contoh: ${usedPrefix + command} https://vt.tiktok.com/ZSYgBPSLD/`;

    if (!text) return m.reply(input);
    if (!(text.includes('http://') || text.includes('https://'))) return m.reply(`URL invalid, please input a valid URL. Try with http:// or https://`);
    if (!text.includes('tiktok.com')) return m.reply(`Invalid TikTok URL.`);

    try {
        const { title, audio } = await tiktok(text);

        if (!audio) return m.reply('Audio not found for this TikTok URL.');
        const audioResponse = await got(audio, { responseType: 'buffer' });
        await conn.sendMessage(m.chat, {
            audio: audioResponse.body,
            mimetype: 'audio/mpeg',
            title: title,
            fileName: `${title}.mp3`
        }, { quoted: m });
    } catch (e) {
        console.error('Error:', e);
        throw e;
    }
};

handler.help = ['ttmp3 <url>'];
handler.tags = ['downloader'];
handler.command = /^ttmp3|ttaudio|tiktokmp3|tiktokaudio$/i;
handler.limit = true;

export default handler;

async function tiktok(url) {
    try {
        const data = new URLSearchParams({
            'id': url,
            'locale': 'id',
            'tt': 'RFBiZ3Bi'
        });

        const headers = {
            'HX-Request': true,
            'HX-Trigger': '_gcaptcha_pt',
            'HX-Target': 'target',
            'HX-Current-URL': 'https://ssstik.io/id',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36',
            'Referer': 'https://ssstik.io/id'
        };

        const response = await axios.post('https://ssstik.io/abc?url=dl', data, { headers });
        const html = response.data;

        const $ = cheerio.load(html);

        const author = $('#avatarAndTextUsual h2').text().trim();
        const title = $('#avatarAndTextUsual p').text().trim();
        const video = $('.result_overlay_buttons a.download_link').attr('href');
        const audio = $('.result_overlay_buttons a.download_link.music').attr('href');

        return {
            title,
            audio
        };
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}
