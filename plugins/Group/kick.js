let handler = async (m, { q, conn, isOwner, setReply }) => {
  const jsonformat = (string) => {
    return JSON.stringify(string, null, 2);
  };
  const numberQuery =
    q.replace(new RegExp("[()+-/ +/]", "gi"), "") + `@s.whatsapp.net`;
  const Input = m.mentionByTag[0]
    ? m.mentionByTag[0]
    : m.mentionByReply
    ? m.mentionByReply
    : q
    ? numberQuery
    : false;

  if (!m.isAdmin && !isOwner) return setReply(mess.only.admin);
  if (!m.isGroup) return setReply(mess.only.group);
  if (!m.isBotAdmin && !isOwner) {
    try {
      const fresh = await conn.refreshGroupMetadata(m.chat).catch(() => null) || null;
      if (fresh && Array.isArray(fresh.participants)) {
        try { if (typeof conn._updateLidMapForGroup === 'function') conn._updateLidMapForGroup(m.chat, fresh) } catch (e) {}
        const botJid = conn.user && (conn.user.id ? conn.user.id.split(":" )[0] + '@s.whatsapp.net' : (conn.user && conn.user.jid ? conn.user.jid : ''));
        const matchBot = (u) => {
          const vals = [u.id, u.jid, u.lid].filter(Boolean);
          return vals.some(v => {
            try { return conn.decodeJid(v) === botJid } catch (_) { return v === botJid }
          });
        };
        const refreshedBot = fresh.participants.find(matchBot) || null;
        if (refreshedBot) {
          m.bot = refreshedBot;
          m.isBotAdmin = !!(refreshedBot && (refreshedBot.admin === 'admin' || refreshedBot.admin === 'superadmin' || refreshedBot.isAdmin === true || refreshedBot.isSuperAdmin === true));
        }
      }
    } catch (e) {
      // ignore
    }
    if (!m.isBotAdmin) return setReply(mess.only.Badmin);
  }
  if (!Input) return setReply("Tag/Mention/Masukan nomer target");
  if (Input.startsWith("08")) return setReply("Awali nomor dengan 62");
  if (Input == m.botNumber)
    return setReply("Gunakan fitur out untuk mengeluarkan bot");

  try {
    await conn.groupParticipantsUpdate(m.chat, [Input], "remove");
    setReply(`Done Bosku, Wkwkwk`);
  } catch (err) {
    try {
      const fresh = await conn.refreshGroupMetadata(m.chat).catch(() => null) || null;
      if (fresh && Array.isArray(fresh.participants)) {
        try { if (typeof conn._updateLidMapForGroup === 'function') conn._updateLidMapForGroup(m.chat, fresh) } catch (e) {}
        const botJid = conn.user && (conn.user.id ? conn.user.id.split(":" )[0] + '@s.whatsapp.net' : (conn.user && conn.user.jid ? conn.user.jid : ''));
        const matchBot = (u) => {
          const vals = [u.id, u.jid, u.lid].filter(Boolean);
          return vals.some(v => {
            try { return conn.decodeJid(v) === botJid } catch (_) { return v === botJid }
          });
        };
        const refreshedBot = fresh.participants.find(matchBot) || null;
        if (refreshedBot) {
          m.bot = refreshedBot;
          m.isBotAdmin = !!(refreshedBot && (refreshedBot.admin === 'admin' || refreshedBot.admin === 'superadmin' || refreshedBot.isAdmin === true || refreshedBot.isSuperAdmin === true));
        }
      }
    } catch (e) {}
    if (!m.isBotAdmin) return setReply(mess.only.Badmin);
    return setReply(jsonformat(err));
  }
};
handler.help = ["kick"];
handler.tags = ["admin"];
handler.command = ["kick", "dorr"];
handler.group = true;
export default handler;
