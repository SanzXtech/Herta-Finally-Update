import fetch from 'node-fetch';

let handler = async (m, { conn }) => {
 m.reply(wait);
    let url = qris[Math.floor(Math.random() * qris.length)];
    conn.sendFile(m.chat, url, 'image.jpg', 'QRIS ALL PAYMENT', m, false, { thumbnail: await (await fetch(url)).buffer() });
}

handler.command = /^(qris)$/i;
handler.tags = ['info'];
handler.help = ['qris'];

export default handler;

global.qris = [
    "https://files.catbox.moe/boigph.jpg"
];
