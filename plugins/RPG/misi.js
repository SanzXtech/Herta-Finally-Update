let handler = async (m, { conn, usedPrefix }) => {
  let caption = `
🚨 Silahkan Pilih Misi Kamu:

⚕️ Dokter\n👷‍♂️ Kuli\n🔧 Montir\n🛵 Ojek\n🛒 Pedagang\n🌾 Petani\n✍️ Penulis\n👩‍🏫 Guru\n🎨 Desainer\n💻 Programmer\n🎵 Musisi\n👮‍♂️ Polisi\n🚒 Damkar\n🐟 Nelayan\n⛏️ Penambang\n🚗 Sopir\n🎥 AktorBokep\n💻 Hacker\n🎖️ Tentara\n📹 Kameramen\n🍽️ Pelayan\n👨🏻‍🍳 Koki

Contoh:
${usedPrefix}kerja ojek
`.trim();
  m.reply(caption);
};
handler.help = ["misi", "misirpg"];
handler.tags = ["info"];
handler.command = /^(misi(rpg)?|misirpg)$/i;
handler.register = true;
handler.group = true;
handler.rpg = true;
export default handler;
