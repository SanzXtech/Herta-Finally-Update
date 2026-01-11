let handler = async (m, { q, conn, args, prefix, command }) => {
  const more = String.fromCharCode(8206);
  const readmore = more.repeat(4001);
  if (!q.includes("|")) return m.reply("Penggunaan teks| teks");
  const text1 = q.substring(0, q.indexOf("|") - 0);
  const text2 = q.substring(q.lastIndexOf("|") + 1);
  m.reply(`${text1}${readmore}${text2}`);
};
handler.help = ["tools"];
handler.tags = ["tools"];
handler.command = ["readmore"];

export default handler;