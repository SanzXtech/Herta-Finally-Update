let handler = async (m, { q, conn, isOwner, command, setReply }) => {
    if (!m.isAdmin && !isOwner) return setReply(mess.only.admin);
    if (!m.isGroup) return setReply(mess.only.group);
    if (!m.isBotAdmin && !isOwner) return setReply(mess.only.Badmin);
    if (!m.users) return setReply("reply/tag targetnya");    
    await conn
      .groupParticipantsUpdate(m.chat, [m.users], "demote")
      .then((res) => setReply(`Sukses Demote ${m.users}`))
      .catch((err) => setReply(jsonformat(err)));
  };
  
  handler.tags = ["admin"];
  handler.command = ["unadmin","demote"];
  handler.group = true;
 
  export default handler;
  
