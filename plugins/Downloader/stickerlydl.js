import axios from "axios";
import cheerio from "cheerio";

let handler = async (m, {
    conn,
    usedPrefix,
    command,
    text
}) => {
    if (!text)
        throw `Contoh:\n${
 usedPrefix + command
 } https://sticker.ly/s/NV6PAN\n${
 usedPrefix + command
 } https://sticker.ly/s/NV6PAN`;

    try {
        let res = await stickerLy1(text);
        
        for (let img of res) {
        conn.toSticker(m.chat, img, m);
        await sleep(2000);
        }
    } catch (e) {
        throw e
    }
};

handler.help = ["stickerlydl"];
handler.tags = ["sticker"];
handler.command = /^(stickerlydl)$/i;
handler.limit = true;

export default handler;

const stickerLy1 = async (urlSticker) => {
    try {
        let { data: a } = await axios.get(urlSticker);
        let $ = cheerio.load(a);

        let stickers = [];
        $('#content_images .sticker_img').each((i, el) => {
            let stickerUrl = $(el).attr('src');
            if (stickerUrl) {
                // Ubah URL menjadi format PNG
                stickerUrl = stickerUrl.replace(/\.(jpg|jpeg|gif|bmp|webp)$/, '.png');
                stickers.push(stickerUrl);
            }
        });

        return stickers;
    } catch (error) {
        console.error(error);
    }
};