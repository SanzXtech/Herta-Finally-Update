const xpperlimit = 1;
let handler = async (m, { conn, command, args }) => {
  let user = global.db.data.users[m.sender];
  let all = command.replace(/^atmall|nabungall|/i, "");
  let count = command.replace(/^nabung|atm/i, "");
  count = count
    ? /all/i.test(count)
      ? Math.floor(global.db.data.users[m.sender].money / xpperlimit)
      : parseInt(count)
    : args[0]
    ? parseInt(args[0])
    : 1;
  count = Math.max(1, count);
  if (user.atm == 0) return m.reply("[❗] ᴋᴀᴍᴜ ʙᴇʟᴏᴍ ᴍᴇᴍᴘᴜɴʏᴀɪ ᴋᴀʀᴛᴜ ᴀᴛᴍ ᴋᴇᴛɪᴋ .ᴄʀᴀғᴛ ᴀᴛᴍ ᴜɴᴛᴜᴋ ᴍᴇᴍʙᴜᴀᴛ ᴀᴛᴍ");
  if (user.bank > user.fullatm) return m.reply("[❗] ᴜᴀɴɢ ᴅɪ ᴀᴛᴍ sᴜᴅᴀʜ ᴘᴇɴᴜʜ!, ᴜᴘɢʀᴀᴅᴇ ᴀᴛᴍ ᴅᴇɴɢᴀɴ ᴋᴇᴛɪᴋ .ᴜᴘɢʀᴀᴅᴇ ᴀᴛᴍ");
  if (count > user.fullatm - user.bank)
    return m.reply("[❗] ᴜᴀɴɢɴʏᴀ sᴜᴅᴀʜ ᴍᴇɴᴄᴀᴘᴀɪ ʙᴀᴛᴀs!, ᴋᴇᴛɪᴋ .ᴜᴘɢʀᴀᴅᴇ ᴀᴛᴍ ᴜɴᴛᴜᴋ ᴍᴇᴍᴘᴇʀʟᴜᴀs ʟɪᴍɪᴛ ᴀᴛᴍ");
  if (global.db.data.users[m.sender].money >= xpperlimit * count) {
    global.db.data.users[m.sender].money -= xpperlimit * count;
    global.db.data.users[m.sender].bank += count;
    conn.reply(m.chat, `sᴜᴋsᴇs ᴍᴇɴᴀʙᴜɴɢ sᴇʙᴇsᴀʀ ${count} ᴍᴏɴᴇʏ 💵`, m);
  } else
    conn.reply(
      m.chat,
      `[❗] ᴜᴀɴɢ ᴛɪᴅᴀᴋ ᴄᴜᴋᴜᴘ ᴜɴᴛᴜᴋ ᴍᴇɴᴀʙᴜɴɢ sᴇʙᴇsᴀʀ ${count} ᴍᴏɴᴇʏ 💵`,
      m
    );
};
handler.help = ["nabung <jumlah>"];
handler.tags = ["rpg"];
handler.command = ['atmall','nabung','nabungall','atm']
handler.rpg = true;
handler.group = true;
export default handler;
