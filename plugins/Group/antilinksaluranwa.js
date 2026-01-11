let handler = async (
  m,
  { conn, q, args, isOwner, setReply, text, command, usedPrefix }
) => {
  if (!db.data.chats[m.chat]) db.data.chats[m.chat] = {}; // Ensure chat data exists
  const isAntilinkSaluranWa = m.isGroup ? db.data.chats[m.chat].antilinksaluranwa : false;

  if (!m.isAdmin) return setReply(mess.only.admin);
  if (!m.isGroup) return setReply("hanya bisa di group");

  if (args[0] === "on" || args[0] === "enable" || args[0] === "1") {
    if (isAntilinkSaluranWa) return setReply("AntilinkSaluranWA V1 sudah aktif kak");
    db.data.chats[m.chat].antilinksaluranwa = true;
    db.data.chats[m.chat].antilinksaluranwav2 = false; // Disable v2 if v1 is enabled
    let ih = `AntilinkSaluranWA V1 aktif kak`;
    setReply(ih);
  } else if (args[0] === "off" || args[0] === "disable" || args[0] === "0") {
    if (!isAntilinkSaluranWa) return setReply("AntilinkSaluranWA V1 sudah mati kak");
    db.data.chats[m.chat].antilinksaluranwa = false;
    let ih = `AntilinkSaluranWA V1 mati kak`;
    setReply(ih);
  } else if (!q) {
    setReply(`
Pilih on atau off
*Example* ${usedPrefix + command} on`);
  }
};
handler.help = ["antilinksaluranwa"];
handler.tags = ["group"];
handler.command = ["antilinksaluranwa"];
handler.group = true;
handler.admin = true;
export default handler;
