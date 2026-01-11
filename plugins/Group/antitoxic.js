let handler = async (
  m,
  { conn,q, args, isOwner, setReply, text, command, usedPrefix }
) => {
  const isAntiBadword = m.isGroup ? db.data.chats[m.chat].antibadword : false;
  if (!m.isAdmin) return setReply(mess.only.admin);
  if (!m.isGroup) return setReply("hanya bisa di group");
  if (args[0] === "on" || args[0] === "enable" || args[0] === "1") {
    if (isAntiBadword) return setReply("Fitur sudah aktif kak");
    db.data.chats[m.chat].antibadword = true;
    let ih = `Fitur anti badword/toxic telah di aktifkan`;
    setReply(ih);
  } else if (args[0] === "off" || args[0] === "disable" || args[0] === "0") {
    if (!isAntiBadword) return setReply("Fitur ini sudah mati sebelumnya");
    db.data.chats[m.chat].antibadword = false;
    let ih = `Fitur anti badword/toxic telah di matikan`;
    setReply(ih);
  } else if (!q) {
    setReply(`
Pilih on atau off
*Example* ${usedPrefix + command} on`);
  }
};
handler.help = ["antibadword"];
handler.tags = ["group"];
handler.command = ["antibadword","antitoxic"];
handler.group = true;
handler.admin = true;
export default handler;
