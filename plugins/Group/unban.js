import _ban from "../../lib/banned.js";

let handler = async (m, { isOwner, setReply, q }) => {
  const ban = db.data.banned;

  if (!isOwner) return setReply("Fitur ini hanya bisa digunakan oleh owner bot!");

  if (q.startsWith("+")) {
    let woke = q.replace(new RegExp("[()+-/ +/]", "gi"), "");
    if (!_ban.check(woke, ban))
      return setReply("User sudah di-unban sebelumnya");
    _ban.del(woke, ban);
    setReply(`Berhasil unbanned ${woke}`);
  } else if (m.users) {
    let Nomer = `${m.users.split("@")[0]}`;
    if (!_ban.check(Nomer, ban))
      return setReply("User sudah di-unban sebelumnya");
    _ban.del(Nomer, ban);
    setReply(`Berhasil unbanned ${Nomer}`);
  } else setReply("Reply/tag/input targetnya");
};

handler.help = ["reply/tag target"];
handler.tags = ["owner"];
handler.command = ["unban", "delban", "unbanned"];
handler.owner = true; // Tambahkan ini untuk otomatis filter hanya owner

export default handler;