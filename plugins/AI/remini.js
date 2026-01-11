/*/import axios from 'axios';
import uploadImage from '../../lib/uploadImage.js';

const handler = async (m, { conn, usedPrefix, command, text }) => {
  conn.enhancer = conn.enhancer || {};

  if (Object.prototype.hasOwnProperty.call(conn.enhancer, m.sender)) {
    throw "Masih Ada Proses Yang Belum Selesai Kak, Silahkan Tunggu Sampai Selesai Yah >//<";
  }

  conn.enhancer[m.sender] = true;

  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || "";

  if (!mime) throw `*❗Example :* ${usedPrefix + command} *[reply/send media]*`;
  if (!/image\/(jpe?g|png)/.test(mime)) throw `Mime ${mime} tidak support`;

  m.reply(wait);

  try {
    const media = await q.download();
    const url = await uploadImage(media);
    const hasil = await Upscale(url);
    await conn.sendFile(m.chat, hasil, "", 'done', m);
  } catch (error) {
    await conn.reply(m.chat, `❗Maaf, terjadi kesalahan: ${error.message}`, m);
  } finally {
    delete conn.enhancer[m.sender];
  }
};

handler.help = ["remini"].map((a) => a + " *[reply/send media]*");
handler.tags = ["tools"];
handler.command = ["remini"];

export default handler;

async function Upscale(url) {
  const maxRetries = 3;
  let attempts = 0;

  while (attempts < maxRetries) {
    try {
      const response = await axios.get(`https://itzpire.com/tools/enhance?url=${encodeURIComponent(url)}&type=modelx2%2025%20JXL`, {
        timeout: 60000
      });

      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = response.data;

      if (data && data.status === "success" && data.result && data.result.img) {
        return data.result.img;
      } else {
        throw new Error('❗Gagal mengambil URL gambar hasil.');
      }
    } catch (error) {
      if (attempts === maxRetries - 1) {
        throw new Error(`❗Error selama proses upscale.`);
      }
      attempts++;
    }
  }
}
/*/