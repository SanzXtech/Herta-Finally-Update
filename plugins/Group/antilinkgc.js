let handler = async (
  m,
  { conn, q, args, isOwner, setReply, text, command, usedPrefix }
) => {
  if (!db.data.chats[m.chat]) db.data.chats[m.chat] = {}; // Ensure chat data exists
  const isAntilinkGc = m.isGroup ? db.data.chats[m.chat].antilinkgc : false;

  if (!m.isAdmin) return setReply(mess.only.admin);
  if (!m.isGroup) return setReply("hanya bisa di group");

  if (args[0] === "on" || args[0] === "enable" || args[0] === "1") {
    if (isAntilinkGc) return setReply("AntilinkV1 sudah aktif kak");
    db.data.chats[m.chat].antilinkgc = true;
    db.data.chats[m.chat].antilinkgcv2 = false; // Disable v2 if v1 is enabled
    let ih = `AntilinkV1 aktif kak`;
    setReply(ih);
  } else if (args[0] === "off" || args[0] === "disable" || args[0] === "0") {
    if (!isAntilinkGc) return setReply("AntilinkV1 sudah mati kak");
    db.data.chats[m.chat].antilinkgc = false;
    let ih = `AntilinkV1 mati kak`;
    setReply(ih);
  } else if (!q) {
    setReply(`
Pilih on atau off
*Example* ${usedPrefix + command} on`);
  }
};
handler.help = ["antilinkgc"];
handler.tags = ["group"];
handler.command = ["antilinkgc"];
handler.group = true;
handler.admin = true;
export default handler;
