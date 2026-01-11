let handler = async (m, { conn, text }) => {
  let monsters = [
    { name: "Goblin" },
    { name: "Slime" },
    { name: "Wolf" },
    { name: "Nymph" },
    { name: "Skeleton" },
    { name: "Wolf" },
    { name: "Baby Demon" },
    { name: "Ghost" },
    { name: "Zombie" },
    { name: "Imp" },
    { name: "Witch" },
    { name: "Zombie" },
    { name: "Ghoul" },
    { name: "Giant Scorpion" },
    { name: "Unicorn" },
    { name: "Baby Robot" },
    { name: "Sorcerer" },
    { name: "Unicorn" },
    { name: "Cecaelia" },
    { name: "Giant Piranha" },
    { name: "Mermaid" },
    { name: "Giant Crocodile" },
    { name: "Nereid" },
    { name: "Mermaid" },
    { name: "Demon" },
    { name: "Harpy" },
    { name: "Killer Robot" },
    { name: "Dullahan" },
    { name: "Manticore" },
    { name: "Killer Robot" },
    { name: "Baby Dragon" },
    { name: "Young Dragon" },
    { name: "Scaled Baby Dragon" },
    { name: "Kid Dragon" },
    { name: "Not so young Dragon" },
    { name: "Scaled Kid Dragon" },
    { name: "Definitely not so young Dragon" },
    { name: "Teen Dragon" },
    { name: "Scaled Teen Dragon" },
  ];

  let player = global.db.data.users[m.sender];
  let cdm = MeNit(new Date() - player.lasthunt);
  let cds = DeTik(new Date() - player.lasthunt);
  let cd1 = Math.ceil(6 - cdm);
  let cd2 = Math.ceil(60 - cds);

  let monster = monsters[Math.floor(Math.random() * monsters.length)].name.toUpperCase();

  if (new Date() - player.lasthunt > 120000) {
    let coins = Math.floor(Math.random() * 401);
    let exp = Math.floor(Math.random() * 601);

    // Generate random damage within a range
    let minDamage = 20; // Minimum damage
    let maxDamage = 40; // Maximum damage
    let dmg = Math.floor(Math.random() * (maxDamage - minDamage + 1)) + minDamage;

    // Adjusted damage calculation based on player's attributes
    dmg -= player.armor * 3; // Reduce damage based on player's armor
    dmg = dmg < 0 ? 0 : dmg; // Ensure damage is not negative

    player.health -= dmg; // Apply damage to player's health
    player.lasthunt = new Date() * 1;

    if (player.health <= 0) {
      let msg = `*${conn.getName(m.sender)}* Anda Mati di Bunuh oleh ${monster}`;
      if (player.level > 0) {
        player.level -= 1;
        msg += `\nLevel Anda Turun 1 karena Mati saat Berburu!`;
      }
      player.health = 100;
      await conn.reply(m.chat, msg, m, { mentions: [m.sender] });
      return;
    }

    player.money += coins;
    player.exp += exp;

    let pesan = `*${conn.getName(m.sender)}* Menemukan dan Membunuh *${monster}*`;
    pesan += `\nMendapatkan ${new Intl.NumberFormat("en-US").format(coins)} coins & ${new Intl.NumberFormat("en-US").format(exp)} XP`;
    pesan += `\nBerkurang -${dmg} HP, Tersisa ${player.health}/100`;
    await conn.reply(m.chat, pesan, m, { mentions: [m.sender] });
  } else {
    throw `Tunggu *00:0${cd1}:${cd2}* untuk Berburu Lagi`;
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
  let m = isNaN(ms) ? 2 : Math.floor(ms / 60000) % 60;
  return [m].map((v) => v.toString().padStart(2, 0)).join(":");
}

function DeTik(ms) {
  let s = isNaN(ms) ? 60 : Math.floor(ms / 1000) % 60;
  return [s].map((v) => v.toString().padStart(2, 0)).join(":");
}