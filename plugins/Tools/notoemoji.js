import { fileTypeFromBuffer } from 'file-type';
import fetch from 'node-fetch';

let handler = async (m, { args }) => {
    if (!args[0]) return m.reply("Penggunaan:\n!notoemoji <emoji>\n\nContoh:\n!notoemoji 😅");
    try {
        m.reply("Tunggu...");
        let unicode = await emojiUnicode(args[0]);
        let url = `https://fonts.gstatic.com/s/e/notoemoji/latest/${unicode}/512.webp`;
        let response = await fetch(url);
        if (!response.ok) throw new Error('Gagal mengunduh gambar');
        
        // Menggunakan response.arrayBuffer() sebagai pengganti response.buffer()
        let arrayBuffer = await response.arrayBuffer();
        let buffer = Buffer.from(arrayBuffer); // Konversi ArrayBuffer ke Buffer

        let mimeType = await getMimeTypeFromBuffer(buffer);
        if (!/image/.test(mimeType)) return m.reply("Emoji tidak didukung");

        conn.sendFile(m.chat, url, "", "", m);
    } catch (e) {
        throw e;
    }
}

handler.command = ["notoemoji"];
handler.help = ["notoemoji"];
handler.tags = ["tools"];

export default handler;

async function getMimeTypeFromBuffer(buffer) {
    const type = await fileTypeFromBuffer(buffer);
    if (type) {
        return type.mime;
    } else {
        console.error('Tipe file tidak ditemukan.');
        return null;
    }
}

function emojiUnicode(input) {
    return emojiUnicode.raw(input).split(' ').map(function (val) {
        return parseInt(val).toString(16);
    }).join(' ');
}

emojiUnicode.raw = function (input) {
    if (input.length === 1) {
        return input.charCodeAt(0).toString();
    } else if (input.length > 1) {
        var pairs = [];
        for (var i = 0; i < input.length; i++) {
            if (input.charCodeAt(i) >= 0xd800 && input.charCodeAt(i) <= 0xdbff) {
                if (input.charCodeAt(i + 1) >= 0xdc00 && input.charCodeAt(i + 1) <= 0xdfff) {
                    pairs.push((input.charCodeAt(i) - 0xd800) * 0x400 + (input.charCodeAt(i + 1) - 0xdc00) + 0x10000);
                }
            } else if (input.charCodeAt(i) < 0xd800 || input.charCodeAt(i) > 0xdfff) {
                pairs.push(input.charCodeAt(i));
            }
        }
        return pairs.join(' ');
    }
    return '';
};
