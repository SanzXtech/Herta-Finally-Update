import axios from "axios";
import FormData from "form-data";
import cheerio from "cheerio";

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `contoh: ${usedPrefix + command} https://pin.it/xwgvQTmG7`;

    try {
        m.reply(wait)
        const {medias,title,thumbnail,duration} = await pindl(text);
        let mp4 = medias.filter(v => v.extension == "mp4");
        if (mp4.length !== 0) {
        await conn.sendMessage(m.chat, {video: {url: mp4[0].url}, caption: `*Pinterest Downloader*`}, {quoted: m})
        } else {
        await conn.sendFile(m.chat, thumbnail, '', `*Pinterest Downloader*`, m)
    }
    
    } catch (e) {
        throw e
    }
}
handler.help = ["pindownload","pindl"];
handler.command = /^(pindl|pindownload)$/i;
handler.tags = ["downloader"];

export default handler;

async function pindl(url) {
try {
const urls = 'https://pinterestdownloader.io/frontendService/DownloaderService';
const params = {
  url
};

let { data } = await axios.get(urls, { params })
return data
} catch (e) {
return {msg: e}
}
}
