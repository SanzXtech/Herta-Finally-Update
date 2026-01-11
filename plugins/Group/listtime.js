import _time from "../../lib/grouptime.js";

let handler = async (m, { setReply }) => {
  const setTime = db.data.others["setTime"];

  if (setTime.length === 0) {
    return setReply("⚠️ Belum ada grup yang diatur untuk buka/tutup otomatis.");
  }

  let teks = "\n\n––––––『 *Daftar Grup* 』––––––\n\n";
  for (let i of setTime) {
    teks += `📌 *Nama Grup*: ${i.name}\n`;
    teks += `⏰ *Buka*: ${i.timeOpen || "Belum disetel"}\n`;
    teks += `⏳ *Tutup*: ${i.timeClose || "Belum disetel"}\n\n`;
  }

  teks += `📊 *Total Grup*: ${setTime.length}\n\n`;
  teks += `📖 *Panduan*:\n`;
  teks += `- Gunakan \`.setopen 01.00\` untuk mengatur waktu buka.\n`;
  teks += `- Gunakan \`.setclose 02.00\` untuk mengatur waktu tutup.\n`;
  teks += `- Gunakan \`.deltime\` untuk menonaktifkan waktu buka/tutup otomatis.\n`;

  setReply(teks);
};

handler.tags = ["admin"];
handler.command = ["listtime"];
handler.group = true;
handler.admin = true;

export default handler;
