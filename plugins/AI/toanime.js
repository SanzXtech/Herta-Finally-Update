import fetch from "node-fetch";
import uploadImage from "../../lib/uploadImage.js";

let handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';
    if (!mime) throw `Balas Gambar Dengan Perintah\n\n${usedPrefix + command}`;
    if (!/image\/(jpe?g|png)/.test(mime)) throw `_*Mime ${mime} tidak didukung!*_`;
    let img = await q.download();
    let url = await uploadImage(img);
    let response = await fetch(`https://api.nyxs.pw/ai-image/jadianime?url=${encodeURIComponent(url)}`);
    let imageData = await response.json();
    let imageUrl = imageData.result;
    conn.sendMessage(m.chat, { image: { url: imageUrl } }, { quoted: m });
  } catch (e) {
    m.reply(`${e}`);
  }
};

handler.help = ["jadianime","toanime"];
handler.tags = ['ai'];
handler.command = /^(jadianime|toanime)$/i;
handler.limit = true;

export default handler;
