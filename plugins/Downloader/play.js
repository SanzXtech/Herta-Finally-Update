import { youtube } from "@xct007/frieren-scraper";

let handler = async (m, { conn, text, setReply, usedPrefix, command }) => {
    if (!text) throw (`Contoh : ${usedPrefix + command} dj aku meriang`);
    setReply("_Tunggu sebentar kak..._");
    try {
        let results = await youtube.search(text);
        
        if (!results || results.length === 0) {
            throw new Error("Video tidak ditemukan.");
        }

        let video = results[0]; // Ambil hasil pertama
        let caption = '';
        caption += `*∘ Title :* ${video.title}\n`;
        caption += `*∘ Duration :* ${video.duration}\n`;
        caption += `*∘ Viewers :* ${video.views}\n`;
        caption += `*∘ Upload At :* ${video.uploaded}\n`;
        caption += `*∘ Author :* ${video.channel}\n`;
        caption += `*∘ Url :* ${video.url}\n`;

        conn.sendMessage(m.chat, {
            document: { url: video.thumbnail },
            fileName: 'YouTube Search Result',
            fileLength: "99999999999999",
            pageCount: 99999,
            caption: caption,
            mimetype: "application/pdf",
            contextInfo: {
                externalAdReply: {
                    title: video.title,
                    body: video.channel,
                    mediaType: 1,
                    renderLargerThumbnail: true,
                    thumbnailUrl: video.thumbnail,
                    sourceUrl: video.url
                }
            },
            buttons: [
                { buttonId: `!ytmp3 ${video.url}`, buttonText: { displayText: "Audio 🎵" }, type: 1, viewOnce: true },
                { buttonId: `!ytmp4 ${video.url}`, buttonText: { displayText: "Video 🎥" }, type: 1, viewOnce: true }
            ],
            headerType: 1,
            viewOnce: true
        }, { quoted: m });
    } catch (e) {
        console.error(e);  
        m.reply('lagi error kak');
    }
};

handler.command = handler.help = ['play'];
handler.tags = ['downloader'];
handler.limit = true;

export default handler;
