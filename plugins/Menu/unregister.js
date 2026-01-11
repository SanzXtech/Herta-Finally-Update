import { createHash } from "crypto";
let handler = async function (m, { args, usedPrefix, command }) {
  let user = global.db.data.users[m.sender];
  user.registered = false;
  user.unreg = true;
  m.reply(`Kamu Berhasil keluar dari database\n\n${copyright}`);
};
handler.help = ["unreg"];
handler.tags = ["xp"];
handler.command = /^unreg(ister)?$/i;
handler.register = true;

export default handler;
