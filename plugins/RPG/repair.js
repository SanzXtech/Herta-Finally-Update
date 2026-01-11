let handler = async (m, { conn, command, args, usedPrefix, DevMode }) => {
  let type = (args[0] || "").toLowerCase();
  let _type = (args[0] || "").toLowerCase();
  let user = global.db.data.users[m.sender];
  global.db.data.users[m.sender].pickaxe =
    global.db.data.users[m.sender].pickaxe || 0;
  global.db.data.users[m.sender].sword =
    global.db.data.users[m.sender].sword || 0;
  global.db.data.users[m.sender].fishingrod =
    global.db.data.users[m.sender].fishingrod || 0;
  global.db.data.users[m.sender].armor =
    global.db.data.users[m.sender].armor || 0;

  let caption = `
Gunakan Format *${usedPrefix}${command} [type]*
contoh *${usedPrefix}${command} pickaxe*

*乂 List Yang Bisa Di Repair*
▧ Pickaxe ⛏️
▧ Sword ⚔️
▧ Fishingrod 🎣
▧ Armor 🥼

*❏ RECIPE*
▧ Pickaxe ⛏️
〉  20 Rock
〉 20 Wood
〉 20 Iron
〉 1 Diamond

▧ Sword ⚔️
〉 20 Wood
〉 20 Iron
〉 2 Gold
〉 1 Diamond

▧ FishingRod 🎣
〉 20 Wood
〉 20 String
〉 20 Iron
〉 1 Diamond

▧ Armor 🥼
〉 15 Iron
〉 2 Gold
〉 1 Diamond
`.trim();

  let skyid = {
    text: caption,
    contextInfo: {
      externalAdReply: {
        title: `ʀᴇᴘᴀɪʀ ᴛᴀʙʟᴇ [ʀᴘɢ]`,
        body: "",
        thumbnailUrl: `https://pomf2.lain.la/f/t9d1myw7.jpg`,
        sourceUrl: `https://whatsapp.com/channel/0029VafEhDUIXnlyGgMSgH2u`,
        mediaType: 1,
        renderLargerThumbnail: true,
      },
    },
  };

  try {
    if (/repair/i.test(command)) {
      const count =
        args[1] && args[1].length > 0
          ? Math.min(99999999, Math.max(parseInt(args[1]), 1))
          : !args[1] || args.length < 3
          ? 1
          : Math.min(1, count);
      switch (type) {
        case "pickaxe":
          if (user.pickaxedurability > 99)
            return m.reply("Tools ini belum memiliki kerusakan");
          if (user.pickaxe == 0) return m.reply("Kamu belum memilik ini");
          if (
            user.diamond < 1 ||
            user.rock < 20 ||
            user.wood < 20 ||
            user.iron < 20
          )
            return m.reply(`Barang tidak cukup!`);
          user.rock -= 20;
          user.wood -= 20;
          user.iron -= 20;
          user.diamond -= 1;
          user.pickaxedurability = 100;
          m.reply("Sukses memperbaiki!");
          break;
        case "sword":
          if (user.sworddurability > 99)
            return m.reply("Tools ini belum memiliki kerusakan");
          if (user.sword == 0) return m.reply("Kamu belum memilik ini");
          if (
            user.diamond < 1 ||
            user.wood < 20 ||
            user.iron < 20 ||
            user.gold < 2
          )
            return m.reply(`Barang tidak cukup!`);
          user.wood -= 20;
          user.iron -= 20;
          user.gold -= 3;
          user.diamond -= 1;
          user.sworddurability = 100;
          m.reply("Sukses memperbaiki!");
          break;
        case "fishingrod":
          if (user.fishingroddurability > 99)
            return m.reply("Tools ini belum memiliki kerusakan");
          if (user.fishingrod == 0) return m.reply("Kamu belum memiliki ini");
          if (
            user.diamond < 1 ||
            user.string < 20 ||
            user.wood < 20 ||
            user.iron < 20
          )
            return m.reply(`Barang tidak cukup!`);
          user.wood -= 20;
          user.string -= 20;
          user.iron -= 20;
          user.diamond -= 1;
          user.fishingroddurability = 100;
          m.reply("Sukses memperbaiki!");
          break;
        case "armor":
          if (user.armordurability > 99)
            return m.reply("Tools ini belum memiliki kerusakan");
          if (user.armor == 0) return m.reply("Kamu belum memilik ini");
          if (user.diamond < 1 || user.iron < 15 || user.gold < 2)
            return m.reply(`Barang tidak cukup!`);
          user.iron -= 15;
          user.gold -= 2;
          user.diamond -= 1;
          user.armordurability = 100;
          m.reply("Sukses memperbaiki!");
          break;          
        default:
          return await conn.sendMessage(m.chat, skyid, { quoted: m });
      }
    }  
  } catch (err) {
    m.reply("Error\n\n\n" + err.stack);
  }
};

handler.help = ["repair"];
handler.tags = ["rpg"];
handler.command = /^(repair)/i;
handler.register = true;
handler.group = true;
handler.rpg = true;
export default handler;
