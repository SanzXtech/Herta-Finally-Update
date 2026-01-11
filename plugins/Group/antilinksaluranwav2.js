let handler = async (
  m,
  { conn, q, args, isOwner, setReply, text, command, usedPrefix }
) => {
  if (!db.data.chats[m.chat]) db.data.chats[m.chat] = {}; // Ensure chat data exists
  const isAntilinkSaluranWaV2 = m.isGroup ? db.data.chats[m.chat].antilinksaluranwav2 : false;

  if (!m.isAdmin) return setReply(mess.only.admin);
  if (!m.isGroup) return setReply("hanya bisa di group");

  if (args[0] === "on" || args[0] === "enable" || args[0] === "1") {
    if (isAntilinkSaluranWaV2) return setReply("AntilinkSaluranWA V2 sudah aktif kak");
    db.data.chats[m.chat].antilinksaluranwav2 = true;
    db.data.chats[m.chat].antilinksaluranwa = false; // Disable v1 if v2 is enabled
    let ih = `AntilinkSaluranWA V2 aktif kak`;
    setReply(ih);
  } else if (args[0] === "off" || args[0] === "disable" || args[0] === "0") {
    if (!isAntilinkSaluranWaV2) return setReply("AntilinkSaluranWA V2 sudah mati kak");
    db.data.chats[m.chat].antilinksaluranwav2 = false;
    let ih = `AntilinkSaluranWA V2 mati kak`;
    setReply(ih);
  } else if (!q) {
    setReply(`
Pilih on atau off
*Example* ${usedPrefix + command} on`);
  }
};
handler.help = ["antilinksaluranwav2"];
handler.tags = ["group"];
handler.command = ["antilinksaluranwav2"];
handler.group = true;
handler.admin = true;
export default handler;
