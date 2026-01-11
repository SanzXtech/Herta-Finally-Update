import _time from "../../lib/grouptime.js";

let handler = async (m, { q, setReply }) => {
  const setTime = db.data.others["setTime"];

  if (!m.isGroup) {
    return setReply("⛔ Perintah ini hanya dapat digunakan di dalam grup.");
  }

  if (!q) {
    return setReply("⚠️ Harap masukkan jam yang valid.\nContoh: `.setopen 01.00`");
  }

  if (!q.includes(".")) {
    return setReply("⚠️ Format tidak valid. Gunakan format jam seperti `01.00`.");
  }

  let waktu = q.replace(".", ":");
  _time.open(m.groupName, m.from, waktu, setTime);
  setReply(`✅ Grup akan dibuka setiap jam ${q}.`);
};

handler.tags = ["admin"];
handler.command = ["setopen"];
handler.group = true;
handler.admin = true;

export default handler;