import { fetch } from 'undici';
import cheerio from 'cheerio';


let handler = async (m, { usedPrefix, command, setReply, conn, text }) => {
  let input = `Contoh : ${usedPrefix + command} https://www.mediafire.com/file/pwxob70rpgma9lz/GBWhatsApp_v8.75%2528Tutorial_Yud%2529.apk/file`;
  if (!text) return m.reply(input);
  if (!(text.includes('http://') || text.includes('https://'))) return m.reply(`URL tidak valid, harap masukkan URL yang valid. Coba dengan menambahkan http:// atau https://`);
  if (!text.includes('mediafire.com')) return m.reply('Link bukan MediaFire');

  m.reply(wait);

  try {
    let res = await mf(text);
    let result = `*MEDIAFIRE DOWNLOADER*

📄 *Name* : ${res.filename}
⚖️ *Detail* : ${res.detail}
📨 *Type* : ${res.filetype}`;

   setReply(result);

  await conn.sendFile(m.chat, res.link, res.filename, "", m, null, { mimetype: res.filetype, asDocument: true });
  } catch (error) {
    m.reply('Terjadi kesalahan saat mengunduh data.');
  }
};

handler.help = ['mediafire <link>'];
handler.tags = ['downloader'];
handler.command = /^(mediafire|mf)$/i;
handler.register = false;
handler.limit = true;

export default handler;

async function mf(url) {
  try {
    const response = await fetch(url);
    const data = await response.text();
    const $ = cheerio.load(data);

    let name = $('.dl-info > div > div.filename').text().trim();
    let link = $('#downloadButton').attr('href');
    let det = $('ul.details').html()
      .replace(/\s/g, "")
      .replace(/<\/li><li>/g, '\n')
      .replace(/<\/?li>|<\/?span>/g, '');
    let type = $('.dl-info > div > div.filetype').text().trim();

    const hasil = {
      filename: name,
      filetype: type,
      link: link,
      detail: det
    };

    return hasil;
  } catch (err) {
    console.error(err);
    throw new Error('Error fetching data from MediaFire');
  }
}
