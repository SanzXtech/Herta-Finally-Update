let handler = async (m, { conn, q, args, setReply, isOwner, command }) => {
  const math = (teks) => {
    return Math.floor(teks);
  };
  if (!q) return setReply("Masukan angka");
  if (isNaN(q)) return setReply(`Harus berupa angka`);
  if (!m.mentionByReply) return setReply("Reply tatgetnya");
  db.data.users[m.mentionByReply].chip = math(q);
  setReply(
    `Berhasil menambakan chip ke nomer ${m.mentionByReply.split("@")[0]}`
  );
};
handler.help = ["owner"];
handler.tags = ["owner"];
handler.command = ["givechip", "addchip"];
handler.owner = true;

export default handler;
