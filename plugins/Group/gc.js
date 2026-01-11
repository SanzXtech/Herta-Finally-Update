let handler = async (m, { q, conn, text, setReply, command, usedPrefix }) => {
  if (!m.isGroup) return setReply(mess.only.group);
  if (!m.isAdmin) return setReply(mess.only.admin);
  if (!m.isBotAdmin) {
    // Try refreshing group metadata once in case admin status is stale
    try {
      const fresh = await conn.refreshGroupMetadata(m.chat).catch(() => null) || null
      if (fresh && Array.isArray(fresh.participants)) {
        // update lid map if available so lid<>jid mapping is current
        try { if (typeof conn._updateLidMapForGroup === 'function') conn._updateLidMapForGroup(m.chat, fresh) } catch (e) {}
        const botJid = conn.user && (conn.user.id ? conn.user.id.split(":")[0] + '@s.whatsapp.net' : (conn.user && conn.user.jid ? conn.user.jid : ''));
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

  if (command == "gc" && q == "close") {
    try {
      await conn.groupSettingUpdate(m.chat, "announcement");
      setReply(`Group telah di tutup`);
    } catch (e) {
      console.error(e);
      try {
        await conn.refreshGroupMetadata(m.chat).catch(() => null);
      } catch (_) {}
      setReply(`Gagal menutup group: ${e && e.message ? e.message : e}`);
    }
  } else if (command == "gc" && q == "open") {
    try {
      await conn.groupSettingUpdate(m.chat, "not_announcement");
      setReply(`Group telah di buka`);
    } catch (e) {
      console.error(e);
      try {
        await conn.refreshGroupMetadata(m.chat).catch(() => null);
      } catch (_) {}
      setReply(`Gagal membuka group: ${e && e.message ? e.message : e}`);
    }
  }  if (command == "close") {
    try {
      await conn.groupSettingUpdate(m.chat, "announcement");
      setReply(`Group telah di tutup`);
    } catch (e) {
      console.error(e);
      try {
        await conn.refreshGroupMetadata(m.chat).catch(() => null);
      } catch (_) {}
      setReply(`Gagal menutup group: ${e && e.message ? e.message : e}`);
    }
  } else if (command == "open") {
    try {
      await conn.groupSettingUpdate(m.chat, "not_announcement");
      setReply(`Group telah di buka`);
    } catch (e) {
      console.error(e);
      try {
        await conn.refreshGroupMetadata(m.chat).catch(() => null);
      } catch (_) {}
      setReply(`Gagal membuka group: ${e && e.message ? e.message : e}`);
    }
  } else if(command == "gc" && !q) {
    setReply(
      `Kirim perintah ${command} _options_\nOptions : close & open\nContoh : ${command} close`
    );
  }
};
handler.help = ["gc open/close"];
handler.tags = ["admin"];
handler.command = ["gc", "group","open","close"];
handler.group = true;
handler.admin = true;
export default handler;