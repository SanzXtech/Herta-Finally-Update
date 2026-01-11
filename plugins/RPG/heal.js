import { join } from "path";
import { promises } from "fs";
import fs from "fs";

let handler = async (m, { q, args, usedPrefix, __dirname, conn }) => {
  let user = global.db.data.users[m.sender];
  if (q == "health") {
    if (user.health >= 200) return conn.reply(m.chat, `Your ❤️health is full!`, m, { mentions: [m.sender] });
    const heal = 40 + user.cat * 4;
    let count =
      Math.max(
        1,
        Math.min(
          Number.MAX_SAFE_INTEGER,
          (isNumber(args[0]) && parseInt(args[0])) ||
            Math.round((200 - user.health) / heal)
        )
      ) * 1;
    if (user.potion < count)
      return conn.sendMessage(m.chat, {
        text: `ʏᴏᴜ ɴᴇᴇᴅ ᴛᴏ ʙᴜʏ ${count - user.potion} ᴍᴏʀᴇ 🥤ᴩᴏᴛɪᴏɴ ᴛᴏ ʜᴇᴀʟ.ʏᴏᴜ'ᴠᴇ ${user.potion} 🥤ᴩᴏᴛɪᴏɴ ɪɴ ʙᴀɢ.`,
        buttons: [
          { buttonId: "!buy potion", buttonText: { displayText: "Buy Potion 🛒" }, type: 1 },
          { buttonId: "!shop", buttonText: { displayText: "Shop 🛒" }, type: 1 },
        ],
        headerType: 1,
      }, { quoted: m });

    user.potion -= count * 1;
    user.health += heal * count;
    conn.reply(m.chat, `sᴜᴄᴄᴇssғᴜʟʟʏ ${count} 🥤ᴩᴏᴛɪᴏɴ ᴜsᴇ ᴛᴏ ʀᴇᴄᴏᴠᴇʀ ʜᴇᴀʟᴛʜ.`, m, { mentions: [m.sender] });
  } else if (q == "stamina") {
    if (user.stamina >= 200) return conn.reply(m.chat, `ᴋᴀᴍᴜ sᴜᴅᴀʜ sᴇʜᴀᴛ 😇`, m, { mentions: [m.sender] });
    let buf = user.cat;
    let buff =
      buf == 0
        ? "5"
        : "" || buf == 1
        ? "10"
        : "" || buf == 2
        ? "15"
        : "" || buf == 3
        ? "20"
        : "" || buf == 4
        ? "25"
        : "" || buf == 5
        ? "30"
        : "" || buf == 6
        ? "35"
        : "" || buf == 7
        ? "40"
        : "" || buf == 8
        ? "45"
        : "" || buf == 9
        ? "50"
        : "" || buf == 10
        ? "100"
        : "" || buf == 11
        ? "100"
        : "";
    const heal = 15 + buff * 4;
    let count =
      Math.max(
        1,
        Math.min(
          Number.MAX_SAFE_INTEGER,
          (isNumber(args[0]) && parseInt(args[0])) ||
            Math.round((200 - user.stamina) / heal)
        )
      ) * 1;
    if (user.potion < count)
      return conn.sendMessage(m.chat, {
        text: `
ᴘᴏᴛɪᴏɴ ᴋᴀᴍᴜ ɢᴀᴄᴜᴋᴜᴘ ᴋᴀᴋ, ᴋᴀᴍᴜ ᴍᴇᴍɪʟɪᴋɪ *${user.potion}* ᴘᴏᴛɪᴏɴ
ᴋᴇᴛɪᴋ *${usedPrefix}ʙᴜʏ ᴘᴏᴛɪᴏɴ ${count - user.potion}* ᴜɴᴛᴜᴋ ᴍᴇᴍʙᴇʟɪ ᴘᴏᴛɪᴏɴ
`.trim(),
        buttons: [
          { buttonId: "!buy potion", buttonText: { displayText: "Buy Potion 🛒" }, type: 1 },
          { buttonId: "!menu", buttonText: { displayText: "Back to Menu ↩️" }, type: 1 },
        ],
        headerType: 1,
      }, { quoted: m });

    user.potion -= count * 1;
    user.stamina += heal * count;
    conn.reply(m.chat, `sᴜᴄᴄᴇssғᴜʟʟʏ ${count} 🥤ᴩᴏᴛɪᴏɴ ᴜsᴇ ᴛᴏ ʀᴇᴄᴏᴠᴇʀ sᴛᴀᴍɪɴᴀ.`, m, { mentions: [m.sender] });
  } else {
    conn.sendMessage(m.chat, {
      text: "❗ᴍᴀsᴜᴋᴀɴ ϙᴜᴇʀʏ, ʜᴇᴀʟᴛʜ ᴀᴛᴀᴜ sᴛᴀᴍɪɴᴀ\n📌ᴇxᴀᴍᴘʟᴇ .ʜᴇᴀʟ sᴛᴀᴍɪɴᴀ",
      buttons: [
        { buttonId: "!heal health", buttonText: { displayText: "Heal Health ❤️" }, type: 1 },
        { buttonId: "!heal stamina", buttonText: { displayText: "Heal Stamina ⚡" }, type: 1 },
      ],
      headerType: 1,
    }, { quoted: m });
  }
};

handler.help = ["heal"];
handler.tags = ["rpg"];
handler.command = /^(heal)$/i;
handler.register = true;
handler.group = true;
handler.rpg = true;
export default handler;

function isNumber(number) {
  if (!number) return number;
  number = parseInt(number);
  return typeof number == "number" && !isNaN(number);
}
