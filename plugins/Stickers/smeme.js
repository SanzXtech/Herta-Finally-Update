const { tmpFile } = await import(`../../lib/uploader.js?v=${Date.now()}`).catch(console.log);
import ffmpeg from 'fluent-ffmpeg';
import fs from "fs-extra";
import path from "path";

let handler = async (m, { q, conn, setReply, prefix, command }) => {
  const isImage = m.type === "imageMessage";
  const isQuotedImage = m.type === "extendedTextMessage" && m.content.includes("imageMessage");
  const isQuotedSticker = m.type === "extendedTextMessage" && m.content.includes("stickerMessage");
  const quoted = m.quoted ? m.quoted : m.msg === undefined ? m : m.msg;

  if (!q) return setReply(`Masukkan teks, contoh: ${prefix}smeme teks atas|teks bawah`);
  setReply(mess.wait);

  let [topRaw, bottomRaw] = q.split("|");
  let top = encodeURIComponent(topRaw?.trim() || "");
  let bottom = encodeURIComponent(bottomRaw?.trim() || "");
if (top.length > 100 || bottom.length > 100) return setReply("Teks terlalu panjang bro! Batas 100 karakter per baris.");

  if (isQuotedSticker) {
    try {
      let inputPath = await conn.downloadAndSaveMediaMessage(quoted, makeid(5));
      let outputPath = getRandomFile(".png");

      await convertWebpToPng(inputPath, outputPath);

      const buffer = await fs.readFile(outputPath);
      const uploaded = await tmpFile(buffer);
      const memeUrl = `https://api.memegen.link/images/custom/${top}/${bottom}.png?background=${uploaded}`;

      log(memeUrl);
      await conn.toSticker(m.chat, memeUrl, m);
    } catch (err) {
      console.error(err);
      setReply("Gagal memproses stiker!");
    } finally {
    //  safeUnlinkAll(); // bersih-bersih
    }

  } else if (isQuotedImage || isImage) {
    try {
      let filePath = await conn.downloadAndSaveMediaMessage(quoted, makeid(5));
      const buffer = await fs.readFile(filePath);
      const uploaded = await tmpFile(buffer);
      const memeUrl = `https://api.memegen.link/images/custom/${top}/${bottom}.png?background=${uploaded}`;

      log(memeUrl);
      await conn.toSticker(m.chat, memeUrl, m);
    } catch (err) {
      console.error(err);
      setReply("Gagal memproses gambar!");
    } finally {
    //  safeUnlinkAll();
    }

  } else {
    setReply("Balas dengan stiker atau gambar!");
  }
};

// Fungsi bantu konversi WebP ke PNG pakai ffmpeg
async function convertWebpToPng(input, output) {
  return new Promise((resolve, reject) => {
    ffmpeg(input)
      .toFormat("png")
      .on("end", () => resolve())
      .on("error", reject)
      .save(output);
  });
}

// Fungsi bantu hapus file yang tersimpan di folder kerja
function safeUnlinkAll() {
  try {
    const tempFiles = fs.readdirSync("./").filter(f => /\.(webp|png|jpg|jpeg)$/i.test(f));
    tempFiles.forEach(file => {
      const filePath = path.resolve("./", file);
      fs.unlinkSync(filePath);
    });
  } catch (e) {
    console.error("Gagal bersih-bersih:", e);
  }
}

handler.help = ["smeme"];
handler.tags = ["tools"];
handler.command = ["smeme"];

export default handler;
