let handler = async (m, { conn, text }) => {
  let monsters = [
    { area: 1, name: "Goblin", damage: 10 },
    { area: 1, name: "Slime", damage: 5 },
    { area: 1, name: "Wolf", damage: 15 },
    { area: 2, name: "Nymph", damage: 12 },
    { area: 2, name: "Skeleton", damage: 20 },
    { area: 2, name: "Wolf", damage: 15 },
    { area: 3, name: "Baby Demon", damage: 25 },
    { area: 3, name: "Ghost", damage: 18 },
    { area: 3, name: "Zombie", damage: 22 },
    { area: 4, name: "Imp", damage: 28 },
    { area: 4, name: "Witch", damage: 30 },
    { area: 4, name: "Zombie", damage: 22 },
    { area: 5, name: "Ghoul", damage: 35 },
    { area: 5, name: "Giant Scorpion", damage: 40 },
    { area: 5, name: "Unicorn", damage: 50 },
    { area: 6, name: "Baby Robot", damage: 45 },
    { area: 6, name: "Sorcerer", damage: 55 },
    { area: 6, name: "Unicorn", damage: 50 },
    { area: 7, name: "Cecaelia", damage: 60 },
    { area: 7, name: "Giant Piranha", damage: 65 },
    { area: 7, name: "Mermaid", damage: 70 },
    { area: 8, name: "Giant Crocodile", damage: 75 },
    { area: 8, name: "Nereid", damage: 80 },
    { area: 8, name: "Mermaid", damage: 70 },
    { area: 9, name: "Demon", damage: 85 },
    { area: 9, name: "Harpy", damage: 90 },
    { area: 9, name: "Killer Robot", damage: 95 },
    { area: 10, name: "Dullahan", damage: 100 },
    { area: 10, name: "Manticore", damage: 105 },
    { area: 10, name: "Killer Robot", damage: 95 },
    { area: 11, name: "Baby Dragon", damage: 110 },
    { area: 11, name: "Young Dragon", damage: 115 },
    { area: 11, name: "Scaled Baby Dragon", damage: 120 },
    { area: 12, name: "Kid Dragon", damage: 125 },
    { area: 12, name: "Not so young Dragon", damage: 130 },
    { area: 12, name: "Scaled Kid Dragon", damage: 135 },
    { area: 13, name: "Definitely not so young Dragon", damage: 140 },
    { area: 13, name: "Teen Dragon", damage: 145 },
    { area: 13, name: "Scaled Teen Dragon", damage: 150 },
  ];

  let player = global.db.data.users[m.sender];
  let cdm = `${MeNit(new Date() - player.lasthunt)}`;
  let cds = `${DeTik(new Date() - player.lasthunt)}`;
  let cd1 = Math.ceil(6 - cdm);
  let cd2 = Math.ceil(60 - cds);

  let selectedMonster = monsters[Math.floor(Math.random() * monsters.length)];
  let monsterName = selectedMonster.name.toUpperCase();
  let monsterDamage = selectedMonster.damage;

  if (new Date() - player.lasthunt > 120000) {
    let coins = Math.floor(Math.random() * 401);
    let exp = Math.floor(Math.random() * 601);

    let armorReduction = player.armor * 5;
    let effectiveDamage = Math.max(0, monsterDamage - armorReduction);

    // Mengurangi durability armor
    let armorDurability = 50 * player.armor;
    if (player.armordurability > 0) {
      player.armordurability -= 1;
      if (player.armordurability <= 0) {
        player.armor -= 1;
        player.armordurability = 50 * player.armor;
      }
    }

    player.health -= effectiveDamage;
    player.lasthunt = new Date() * 1; // waktu hunt 2 menit

    if (player.health <= 0) {
      let msg = `*@${
        m.sender.split("@")[0]
      }* Anda Mati Dibunuh Oleh ${monsterName}`;
      if (player.level > 0) {
        player.level -= 1;
        msg += `\nLevel Anda Turun 1 Karena Mati Saat Berburu!`;
      }
      player.health = 100;
      m.reply(msg);
      return;
    }

    player.money += coins;
    player.exp += exp;

    let pesan = `*@${
      m.sender.split("@")[0]
    }* Menemukan Dan Membunuh *${monsterName}*\nMendapatkan ${new Intl.NumberFormat(
      "en-US"
    ).format(coins)} coins & ${new Intl.NumberFormat("en-US").format(
      exp
    )} XP\nBerkurang -${effectiveDamage} Hp, Tersisa ${player.health}/${100}\nDurability Armor: ${player.armordurability}/${50 * player.armor}`;
    await conn.reply(m.chat, pesan, m, { mentions: [m.sender] });
  } else {
    throw `Tunggu *00:0${cd1}:${cd2}* Untuk Berburu Lagi`;
  }
};

handler.help = ["hunt"];
handler.tags = ["rpg"];
handler.command = /^hunt/i;
handler.register = true;
handler.group = true;
handler.rpg = true;
export default handler;

function MeNit(ms) {
  let m = isNaN(ms) ? "02" : Math.floor(ms / 60000) % 60;
  return [m].map((v) => v.toString().padStart(2, 0)).join(":");
}

function DeTik(ms) {
  let s = isNaN(ms) ? "60" : Math.floor(ms / 1000) % 60;
  return [s].map((v) => v.toString().padStart(2, 0)).join(":");
}