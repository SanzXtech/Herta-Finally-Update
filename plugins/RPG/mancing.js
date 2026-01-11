let handler = async (m, { conn, usedPrefix, args }) => {
  let __timers = new Date() - global.db.data.users[m.sender].lastmancing;
  let _timers = 3600000 - __timers;
  let timers = clockString(_timers);
  let name = conn.getName(m.sender);
  let user = global.db.data.users[m.sender];
  let id = m.sender;
  let kerja = "Memancing";

  const fishingRodLevels = {
    0: "❌",
    1: "Wooden Fishingrod",
    2: "Stone Fishingrod",
    3: "Iron Fishingrod",
    4: "Gold Fishingrod",
    5: "Copper Fishingrod",
    6: "Diamond Fishingrod",
    7: "Emerald Fishingrod",
    8: "Crystal Fishingrod",
    9: "Obsidian Fishingrod",
    10: "God Fishingrod",
    11: "Sanz's DevRod"
  };

  const fishingDifficulties = {
    easy:    { requiredRodLevel: 1,  multiplier: 1,  emoji: "⚪", upgradesNeeded: 0, minUmpan: 10,  maxUmpan: 25 },
    medium:  { requiredRodLevel: 3,  multiplier: 2,  emoji: "🔘", upgradesNeeded: 2, minUmpan: 20,  maxUmpan: 50 },
    hard:    { requiredRodLevel: 5,  multiplier: 4,  emoji: "🔸", upgradesNeeded: 4, minUmpan: 40,  maxUmpan: 100 },
    extreme: { requiredRodLevel: 7,  multiplier: 8,  emoji: "🔶", upgradesNeeded: 6, minUmpan: 80,  maxUmpan: 200 },
    impossible: { requiredRodLevel: 9, multiplier: 15, emoji: "🔻", upgradesNeeded: 8, minUmpan: 150, maxUmpan: 350 },
    god:     { requiredRodLevel: 11, multiplier: 50, emoji: "⭐", upgradesNeeded: 10, minUmpan: 200, maxUmpan: 500 }
  };

  conn.mancing = conn.mancing ? conn.mancing : {};
  if (id in conn.mancing) {
    return conn.reply(m.chat, `Selesaikan mancing ${conn.mancing[id][0]} terlebih dahulu`, m);
  }

  let difficulty = args[0]?.toLowerCase();
  if (!difficulty) {
    return m.reply(`Difficulty: easy | medium | hard | extreme | impossible | god\n\nUsage: ${usedPrefix}mancing [difficulty]`);
  }

  if (!fishingDifficulties[difficulty]) {
    return m.reply(`❌ Difficulty tidak valid!\nGunakan: easy, medium, hard, extreme, impossible, god`);
  }

  let selected = fishingDifficulties[difficulty];

  if (!user.fishingrod) user.fishingrod = 0;
  if (!user.fishingroddurability) user.fishingroddurability = 0;
  if (!user.umpan) user.umpan = 0;
  if (!user.stamina) user.stamina = 0;
  if (!user.strength) user.strength = 0;
  if (!user.lastmancing) user.lastmancing = 0;

  if (user.fishingrod == 0) return m.reply("⚠️ Kamu belum memiliki Fishingrod!\n\n🔨 Ketik .craft fishingrod untuk membuat fishingrod pertamamu!");

  if (user.fishingrod < 11 && user.fishingroddurability <= 0) {
    return m.reply("❗ Fishingrod kamu rusak!\n\nKetik .repair fishingrod untuk memperbaiki fishingrod mu!");
  }

  if (user.fishingrod < selected.requiredRodLevel) {
    return m.reply(`⚠️ Fishingrod kamu belum memadai!\n🎯 Dibutuhkan: ${fishingRodLevels[selected.requiredRodLevel]}`);
  }

  if (user.umpan < selected.minUmpan) {
    return m.reply(`❗ Umpan kamu tidak cukup untuk memancing di difficulty ini!\nMinimal umpan: ${selected.minUmpan}`);
  }

  let umpanUsed = Math.floor(Math.random() * (selected.maxUmpan - selected.minUmpan + 1)) + selected.minUmpan;
  if (user.umpan < umpanUsed) {
    return m.reply(`❗ Umpan kamu kurang untuk memancing kali ini!\nButuh: ${umpanUsed} umpan | Punya: ${user.umpan}`);
  }

  if (user.stamina < 50) {
    return m.reply("⚠️ Kamu butuh setidaknya 50 stamina ⚡ untuk memancing.");
  }

  if (user.strength < 2) {
    return m.reply("⚠️ Kamu butuh [ Ability Strength 2 💪🏻 ] untuk memancing.\nLatih dengan perintah .latih");
  }

  if (new Date() - user.lastmancing > 3600000) {
    let mlt = selected.multiplier;

    let ikan = {
      kepiting: Math.floor(Math.random() * 5 * mlt),
      lobster: Math.floor(Math.random() * 5 * mlt),
      udang: Math.floor(Math.random() * 5 * mlt),
      cumi: Math.floor(Math.random() * 5 * mlt),
      gurita: Math.floor(Math.random() * 5 * mlt),
      buntal: Math.floor(Math.random() * 5 * mlt),
      dory: Math.floor(Math.random() * 5 * mlt),
      orca: Math.floor(Math.random() * 5 * mlt),
      lumba: Math.floor(Math.random() * 5 * mlt),
      paus: Math.floor(Math.random() * 5 * mlt),
      hiu: Math.floor(Math.random() * 5 * mlt)
    };

    let energi = Math.floor(Math.random() * 40);

    let hasil = `🎣 *HASIL MEMANCING* ${selected.emoji}
    
🪱 Umpan digunakan: ${umpanUsed}
🛠️ Fishingrod: ${fishingRodLevels[user.fishingrod]}
⚡ Stamina berkurang: ${energi}

📦 *Tangkapan Berhasil:*
${ikan.kepiting ? `🦀 Kepiting : ${ikan.kepiting}` : ""}
${ikan.lobster ? `🦞 Lobster : ${ikan.lobster}` : ""}
${ikan.udang ? `🦐 Udang : ${ikan.udang}` : ""}
${ikan.cumi ? `🦑 Cumi : ${ikan.cumi}` : ""}
${ikan.gurita ? `🐙 Gurita : ${ikan.gurita}` : ""}
${ikan.buntal ? `🐡 Buntal : ${ikan.buntal}` : ""}
${ikan.dory ? `🐠 Dory : ${ikan.dory}` : ""}
${ikan.orca ? `🐳 Orca : ${ikan.orca}` : ""}
${ikan.lumba ? `🐬 Lumba : ${ikan.lumba}` : ""}
${ikan.paus ? `🐋 Paus : ${ikan.paus}` : ""}
${ikan.hiu ? `🦈 Hiu : ${ikan.hiu}` : ""}`.trim();

    for (let key in ikan) {
      user[key] = (user[key] || 0) + ikan[key];
    }

    user.stamina -= energi;
    user.umpan -= umpanUsed;
    if (user.fishingrod < 11) user.fishingroddurability -= 10;

    conn.mancing[id] = [
      `${kerja} ${selected.emoji}`,
      setTimeout(() => delete conn.mancing[id], 5000)
    ];

    setTimeout(() => m.reply(hasil), 2000);
    user.lastmancing = new Date() * 1;

  } else {
    m.reply(`⏳ Mohon tunggu ${timers} sebelum memancing kembali.`);
  }
};

handler.help = ["mancing <difficulty>"];
handler.tags = ["rpg"];
handler.command = /^(mancing|fishing|memancing)$/i;
handler.register = true;
handler.group = true;
handler.level = 10;
handler.rpg = true;
export default handler;

function clockString(ms) {
  let h = Math.floor(ms / 3600000);
  let m = Math.floor(ms / 60000) % 60;
  let s = Math.floor(ms / 1000) % 60;
  return [h, m, s].map((v) => v.toString().padStart(2, 0)).join(":");
}