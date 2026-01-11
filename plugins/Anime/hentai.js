import fetch from "node-fetch";
import cheerio from "cheerio";
import axios from "axios";

let handler = async (m, { text, conn }) => {
    if (!text) return m.reply('Please provide a text');

    m.reply(wait);

    try {
        let bjir = await hengtai(); // Tunggu hasil dari hengtai
        // Filter atau ambil data dari bjir sesuai kebutuhan
        let { title, category, share_count, views_count, video_1 } = bjir[0]; // Ambil hasil pertama atau sesuaikan

        let dahla = `
            Title: ${title}
            Category: ${category}
            Views: ${views_count}
            Shares: ${share_count}
        `;

        conn.sendMessage(m.chat, { video: { url: video_1 }, caption: dahla }, { quoted: m }); // Mengirim pesan

    } catch (e) {
        m.reply(`Error: ${e}`);
    }
};

handler.help = handler.command = ["hentai"];
handler.tags = ["downloader"];
handler.group = true
handler.prem = true

export default handler;

async function hengtai() {
    return new Promise((resolve, reject) => {
        const page = Math.floor(Math.random() * 1153);
        axios.get('https://sfmcompile.club/page/' + page)
            .then((response) => {
                const $ = cheerio.load(response.data);
                const hasil = [];
                $('#primary > div > div > ul > li > article').each(function (a, b) {
                    hasil.push({
                        title: $(b).find('header > h2').text(),
                        link: $(b).find('header > h2 > a').attr('href'),
                        category: $(b).find('header > div.entry-before-title > span > span').text().replace('in ', ''),
                        share_count: $(b).find('header > div.entry-after-title > p > span.entry-shares').text(),
                        views_count: $(b).find('header > div.entry-after-title > p > span.entry-views').text(),
                        video_1: $(b).find('source').attr('src') || $(b).find('img').attr('data-src'),
                    });
                });
                resolve(hasil);
            })
            .catch((error) => {
                reject(error);
            });
    });
}
