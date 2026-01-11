let handler = async (m, { conn, q, args, setReply, isOwner, command }) => {
  const math = (teks) => {
    return Math.floor(teks);
  };
  if (!q) return setReply("Masukan angka");
  if (isNaN(q)) return setReply(`Harus berupa angka`);
  if (!m.mentionByReply) return setReply("Reply tatgetnya");
  db.data.users[m.mentionByReply].exp = math(q);
  setReply(
    `Berhasil menambakan exp ke nomer ${m.mentionByReply.split("@")[0]}`
  );
};
handler.help = ["owner"];
handler.tags = ["owner"];
handler.command = ["giveexp", "addexp"];
handler.owner = true;

export default handler;
