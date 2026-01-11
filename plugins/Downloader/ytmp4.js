import axios from "axios";

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `Masukan URL! Youtube`;
  m.reply(wait);
  try {
    let { downloads }= await ytmp3.convert(text, "mp4");

    await conn.sendMessage(m.chat, { video: { url: downloads} }, { quoted: m });

  } catch (err) {
    console.log(err);
    m.reply('Gagal mengunduh video');
  }
};

handler.help = ['ytmp4', 'ytv', 'ytvideo'];
handler.tags = ['downloader'];
handler.command = /^(ytmp4|ytv|ytvideo)$/i;
handler.limit = true;
handler.register = true;

export default handler;

const ytmp3 = {
  backend: '.ymcdn.org',
  format: 'mp3',
  headers: {
    'accept': '*/*',
    'user-agent': 'Postify/1.0.0',
    'origin': 'https://ytmp3.mobi',
    'referer': 'https://ytmp3.mobi/'
  },

  request: async (url, params = {}) => {
    const { data } = await axios.get(url, { headers: ytmp3.headers, params });
    return data;
  },

  convert: async (url, format = ytmp3.format) => {
    try {
      if (!url) {
        throw new Error('Mulai dah mulai! Linknya mana? 🗿');
      }

      if (!['mp3', 'mp4'].includes(format)) {
        throw new Error('Formatnya kagak valid bree, input yang bener!');
      }

      const videoId = url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/)?.[1];
      if (!videoId) throw new Error('Link youtubenya kagak valid bree 🗿');

      const init = await ytmp3.request(`https://d${ytmp3.backend}/api/v1/init`, { p: 'y', '23': '1llum1n471', _: Math.random() });
      if (init.error) throw new Error(`${init.error}`);

      const response = await ytmp3.request(init.convertURL, { v: videoId, f: format, _: Math.random() });
      if (response.error) throw new Error(`${response.error}`);

      let progress;
      do {
        progress = await ytmp3.request(response.progressURL);
        console.log(`🚀 Progress: ${progress.progress}, 🔺 Percent: ${progress.percent}`);
        if (progress.error) throw new Error(`${progress.error}`);
        if (progress.progress < 3) await new Promise(resolve => setTimeout(resolve, 1000));
      } while (progress.progress < 3);

      const { directLink, fileSize } = await ytmp3.redirect(response.downloadURL);

      return {
        title: progress.title,
        fileSize,
        format,
        videoId,
        videoUrl: url,
        downloads: response.downloadURL,
        directLink
     };
    } catch (error) {
      return {
        error: error.message,
        videoUrl: url,
        format
      };
    }
  },

  redirect: async (url) => {
    try {
      const response = await axios.get(url, {
        headers: ytmp3.headers,
        maxRedirects: 0,
        validateStatus: status => status >= 200 && status < 400
      });

      const directLink = response.status === 302 ? response.headers.location : url;
      const fileSize = await ytmp3.checkSize(directLink);

      return { directLink, fileSize };
    } catch (error) {
      console.error(error.message);
      return { directLink: null, fileSize: 'Unknown' };
    }
  },

  checkSize: async (url) => {
    try {
      const { headers, data } = await axios.get(url, {
        headers: { ...ytmp3.headers, Range: 'bytes=0-1000000' },
        responseType: 'arraybuffer'
      });

      let totalSize = parseInt(headers['content-range']?.match(/\/(\d+)/)?.[1], 10);
      if (!totalSize) totalSize = data.byteLength * 100;

      return ytmp3.formatFileSize(totalSize);
    } catch (error) {
      console.error(error.message);
      return 'Unknown';
    }
  },

  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
};
