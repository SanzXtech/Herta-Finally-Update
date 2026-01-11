let handler = async (m, { command, usedPrefix, args }) => {
  let type = (args[0] || "").toLowerCase();
  let user = global.db.data.users[m.sender];
  let tegoh = `${user.stamina}`;

  // Cooldown duration in milliseconds
  const cooldownDuration = 5 * 60 * 1000; // 5 minutes
  const currentTime = new Date().getTime();

  // Check if cooldown is active for specific training types
  if (["kecepatan", "ketangguhan", "kekuatan"].includes(type) && user.lasttraine && currentTime < user.lasttraine + cooldownDuration) {
    const timeLeftMs = user.lasttraine + cooldownDuration - currentTime;
    const minutesLeft = Math.floor(timeLeftMs / 60000);
    const secondsLeft = Math.floor((timeLeftMs % 60000) / 1000);

    return conn.reply(m.chat, `Kamu harus menunggu ${minutesLeft} menit ${secondsLeft} detik sebelum bisa melatih ${type} lagi.`, m);
  }

  // Display training options if type is not specified or invalid
  if (!["kecepatan", "ketangguhan", "kekuatan", "fisik"].includes(type)) {
    let cok = `「 *ʟᴀᴛɪʜ ғɪsɪᴋ ᴍᴜ ʙᴇʀsᴀᴍᴀ ᴍᴀsᴛᴇʀ* 」\n\nApa Yang ingin Kamu Latih?\n▧ [🏃🏻] kecepatan\n▧ [🛡️] ketangguhan\n▧ [💪🏻] kekuatan\n▧ [⚡] fisik\n\nContoh penggunaan: .latih <ability> <jumlah>\n    .latih kecepatan 10\n\nKemampuan ${user.name} Saat Ini:\n🏃🏻: ${user.speed}\n🛡️: ${user.defense}\n💪🏻: ${user.strength}\n⚡: ${user.stamina}`;
    
    let skyid = {
      text: cok.trim(),
      contextInfo: {
        externalAdReply: {
          title: `ᴛʀᴀɪɴɪɴɢ ɢʀᴏᴜɴᴅs`,
          body: "",
          thumbnailUrl: `https://telegra.ph/file/c23b185a32c283de52070.jpg`,
          sourceUrl: `https://whatsapp.com/channel/0029VafEhDUIXnlyGgMSgH2u`,
          mediaType: 1,
          renderLargerThumbnail: true,
        },
      },
    };
    
    return conn.sendMessage(m.chat, skyid, { quoted: m });
  }

  try {
    const count = args[1] && args[1].length > 0 ? Math.min(5, Math.max(parseInt(args[1]), 1)) : 1;

    switch (type) {
      case "kecepatan":
        if (user.stamina >= count * 50) {
          user.stamina -= count * 50;
          user.speed += count;
          user.lasttraine = currentTime; // Set cooldown
          conn.reply(m.chat, `Kamu berhasil melatih kecepatanmu. Speed bertambah +${count} 🏃🏻`, m);
        } else {
          conn.reply(m.chat, `Stamina tidak cukup. Kamu memerlukan ${count * 50} ⚡ untuk berlatih. Stamina saat ini: ${tegoh} ⚡`, m);
        }
        break;
      case "ketangguhan":
        if (user.stamina >= count * 30) {
          user.stamina -= count * 30;
          user.defense += count;
          user.lasttraine = currentTime; // Set cooldown
          conn.reply(m.chat, `Kamu berhasil melatih ketangguhanmu. Defense bertambah +${count} 🛡️`, m);
        } else {
          conn.reply(m.chat, `Stamina tidak cukup. Kamu memerlukan ${count * 30} ⚡ untuk berlatih. Stamina saat ini: ${tegoh} ⚡`, m);
        }
        break;
      case "kekuatan":
        if (user.stamina >= count * 20) {
          user.stamina -= count * 20;
          user.strength += count;
          user.lasttraine = currentTime; // Set cooldown
          conn.reply(m.chat, `Kamu berhasil melatih kekuatanmu. Strength bertambah +${count} 💪🏻`, m);
        } else {
          conn.reply(m.chat, `Stamina tidak cukup. Kamu memerlukan ${count * 20} ⚡ untuk berlatih. Stamina saat ini: ${tegoh} ⚡`, m);
        }
        break;
      case "fisik":
        user.stamina += count * 10; // Increase stamina with 'fisik' training
        conn.reply(m.chat, `Berhasil melatih fisikmu. Stamina bertambah +${count * 10} ⚡`, m);
        break;
      default:
        conn.reply(m.chat, "Pilihan latihan tidak dikenal. Silakan pilih antara kecepatan, ketangguhan, kekuatan, atau fisik.", m);
    }
  } catch (e) {
    conn.reply(m.chat, `Sepertinya ada yang error, coba laporkan ke owner ya`, m);
    console.log(e);
  }
};

handler.help = ["latih <ability> <jumlah>", "enhance <ability> <jumlah>"];
handler.tags = ["rpg"];
handler.command = /^(latih|enhance)$/i;

export default handler;
