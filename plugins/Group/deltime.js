import _time from "../../lib/grouptime.js";

let handler = async (m, { conn, isOwner, setReply }) => {
  const setTime = db.data.others["setTime"];

  if (!m.isGroup) {
    return setReply("Perintah ini hanya bisa digunakan di dalam grup.");
  }

  // Hapus timer berdasarkan ID grup
  const result = _time.del(m.chat, setTime);

  if (result) {
    // Timer ditemukan dan dihapus
    setReply("⏳ Timer telah berhasil dihapus untuk grup ini.");
  } else {
    // Timer tidak ditemukan
    setReply("⚠️ Timer belum diatur untuk grup ini.");
  }
};

handler.tags = ["admin"];
handler.command = ["deltime", "delltime"];
handler.group = true;
handler.admin = true;

export default handler;
