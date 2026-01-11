let handler = async (m, { conn, text }) => {
if (!text) return m.reply('*Contoh:* .ytcoment teks nya');

    let user = conn.getName(m.sender);

    let buffer = `https://some-random-api.com/canvas/youtube-comment?avatar=https://telegra.ph/file/24fa902ead26340f3df2c.png&comment=${encodeURIComponent(text)}&username=${user}`;
    await conn.sendFile(m.chat, buffer, 'comment.png', '', m);
};

handler.help = ['ytcoment'];
handler.tags = ['tools'];
handler.command = /^(ytcoment)$/i;

export default handler;
