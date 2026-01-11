import axios from "axios";
const douyin = async (url) => {
  const api = "https://lovetik.app/api/ajaxSearch";
  const payload = { q: url, lang: "en" };

  try {
    const { data } = await axios.post(api, payload, {
      headers: {
        accept: "*/*",
        "accept-language": "en-US,en;q=0.9",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        origin: "https://lovetik.app",
        priority: "u=1, i",
        referer: "https://lovetik.app/en",
        "sec-ch-ua":
          '"Not A(Brand";v="8", "Chromium";v="132", "Microsoft Edge";v="132"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 Edg/132.0.0.0",
        "x-requested-with": "XMLHttpRequest",
      },
      transformRequest: [
        (data) =>
          Object.keys(data)
            .map(
              (key) =>
                `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`
            )
            .join("&"),
      ],
    });

    const extractData = data.data;

    const downloadUrls =
      extractData.match(
        /https:\/\/(dl\.snapcdn\.app|v\d+-cold\.douyinvod\.com)\/get\?token=[^"]+/g
      ) || [];
    const thumbnailMatch = /<img src="([^"]+)"/.exec(extractData);
    const thumbnail = thumbnailMatch ? thumbnailMatch[1] : null;
    const titleMatch = /<h3>(.*?)<\/h3>/.exec(extractData);
    const title = titleMatch ? titleMatch[1] : null;

    return {
      title,
      thumbnail,
      downloadUrls,
    };
  } catch (error) {
    console.error("Error:", error.message);
    return {
      error:
        "Unable to fetch media information at this time. Please try again.",
    };
  }
};

const handler = async (m, { conn, text, command, usedPrefix }) => {
  if (!text)
    return m.reply(
      `Gunakan format:\n${usedPrefix}${command} <url>\n\nContoh:\n${usedPrefix}${command} https://www.douyin.com/video/7256984651137289483`
    );

  try {
    const result = await douyin(text);

    if (result.error) {
      return m.reply(result.error);
    }

    const { title, downloadUrls } = result;

    if (downloadUrls.length > 0) {
      const videoUrl = downloadUrls[0]; // Ambil URL video
      const musicUrl = downloadUrls[downloadUrls.length - 1]; 

      // Kirim video
      const video = await axios.get(videoUrl, { responseType: "arraybuffer" });
      const videoBuffer = Buffer.from(video.data);
      await conn.sendFile(m.chat, videoBuffer, "video.mp4", `*Judul:* ${title}`, m);

      // Kirim musik
      const music = await axios.get(musicUrl, { responseType: "arraybuffer" });
      const musicBuffer = Buffer.from(music.data);
      await conn.sendFile(
        m.chat,
        musicBuffer,
        "music.mp3",
        "Ryzxell",
        m,
        false,
        {
          mimetype: "audio/mpeg",
        }
      );
    } else {
      m.reply("Gagal mendapatkan media. Silakan coba lagi.");
    }
  } catch (error) {
    console.error(error.message);
    m.reply("Terjadi kesalahan saat memproses permintaan Anda.");
  }
};

handler.command = /^(douyin|dy)$/i;
handler.help = ["douyin <url>"];
handler.tags = ["downloader"];

export default handler;