import { Sticker } from 'wa-sticker-formatter';
import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (m.quoted && m.quoted.text) {
        text = m.quoted.text || 'hai';
    } else if (!text) {
        return m.reply('Reply atau masukkan teks');
    }

    try {
        await m.reply('Tunggu Sebentar Kak🕒');

        const apiUrl = `https://rest.cloudkuimages.com/api/maker/bratanime?text=${encodeURIComponent(text)}`;
        
        let stiker = await createSticker(apiUrl, 'isi sendiri wmnya', 'CloudRestApi', 100);
        if (stiker) await conn.sendFile(m.chat, stiker, '', '', m);
    } catch (e) {
        console.error(e);
        m.reply('Terjadi kesalahan, coba lagi nanti!');
    }
};

handler.help = ['bratanime'];
handler.tags = ['tools'];
handler.command = /^(bratanime)$/i;
handler.limit = true;
handler.onlyprem = true;

export default handler;

async function createSticker(url, packName, authorName, quality) {
    let res = await fetch(url);
    let buffer = await res.buffer(); 
    let stickerMetadata = {
        type: 'full',
        pack: packName,
        author: authorName,
        quality: 100
    };
    return (new Sticker(buffer, stickerMetadata)).toBuffer();
}
