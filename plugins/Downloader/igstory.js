import axios from "axios";
import cheerio from "cheerio";
import qs from "qs";

let handler = async (m, { conn, text, usedPrefix, args, command }) => {
    if (!text) return m.reply(`*Contoh:* ${usedPrefix + command} url`);
    
    m.reply(wait);

    let res = await instanav(text);
    let result = res.downloadUrls;

        conn.sendFile(m.chat, result, null, 'Ini Dia Kak', m);
};

handler.help = ['instagramstory']
handler.tags = ['downloader'];
handler.command = /^(igstory|instagramstory)$/i;
handler.limit = true;

export default handler;

async function instanav(url) {
    const data = qs.stringify({
        'q': url,
        't': 'media',
        'lang': 'en'
    });

    const config = {
        method: 'POST',
        url: 'https://instanavigation.app/api/ajaxSearch',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Android 10; Mobile; rv:131.0) Gecko/131.0 Firefox/131.0',
            'Accept': 'application/json, text/javascript, */*; q=0.01',
            'accept-language': 'id-ID',
            'referer': 'https://instanavigation.app/',
            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'x-requested-with': 'XMLHttpRequest',
            'origin': 'https://instanavigation.app',
            'alt-used': 'instanavigation.app',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'priority': 'u=0',
            'te': 'trailers',
        },
        data: data
    };

    const api = await axios.request(config);
    const html = api.data.data;

    const $ = cheerio.load(html);
    const thumbnail = $('.download-items__thumb img').attr('src');

    const downloadUrls = [];
    $('.download-items__btn a').each((index, element) => {
        const href = $(element).attr('href');
        if (href) {
            downloadUrls.push(href);
        }
    });

    const urlParams = new URLSearchParams(downloadUrls[0]?.split('?')[1]);
    let filename = urlParams.get('filename');
    if (filename && filename.endsWith('.mp4')) {
        filename = filename.slice(0, -4);
    }

    return {
        title: filename || 'Title not found',
        thumbnail: thumbnail || 'Thumbnail not found',
        downloadUrls: downloadUrls.length > 0 ? downloadUrls : ['Download URL not found']
    };
}
