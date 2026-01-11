let handler = async (m, { conn, usedPrefix, participants }) => {
  conn.level = global.db.data.users[m.sender];
  conn.fightpet = conn.fightpet ? conn.fightpet : {};
  const delay = (time) => new Promise((res) => setTimeout(res, time));

  if (global.db.data.users[m.sender].cat < 1) {
    return m.reply(`Kamu tidak memiliki kucing saat ini. Silakan beli kucing di petshop atau coba gacha di *tbox* untuk mendapatkan kucing!`);
    }

  if (typeof conn.fightpet[m.sender] != "undefined" && conn.fightpet[m.sender] == true) {
    return m.reply(`*Tidak Bisa Melakukan Battle Karena Arena Yang Kamu Miliki Sedang Kamu Pakai Untuk Pet Yang Lain .*`);
  }

  let users = participants.map((u) => u.id);
  var lawan;
  lawan = users[Math.floor(users.length * Math.random())];

  while (typeof global.db.data.users[lawan] == "undefined" || lawan == m.sender) {
    lawan = users[Math.floor(users.length * Math.random())];
  }

  let lamaPertarungan = Acakin(5, 5);

  m.reply(
    `*Pet Kamu* (Kucing ${global.db.data.users[m.sender].cat}) Menantang Kucingnya *${conn.getName(lawan)}* (Kucing ${global.db.data.users[lawan].cat}) Lagi Kelahi Rebutin Bini.\n\nTunggu ${lamaPertarungan} Menit Lagi Dan Lihat Siapa Yang Menang.`
  );

  conn.fightpet[m.sender] = true;

  await delay(300000);

  let alasanKalah = ['Naikin Lagi Levelnya', 'Cupu', 'Kurang Hebat', 'Ampas Petnya', 'Pet Gembel'];
  let alasanMenang = ['Hebat', 'Pro', 'Ganas Pet', 'Legenda Pet', 'Sangat Pro', 'Rajin Ngasi Makan Pet'];

  let kesempatan = [];
  for (let i = 0; i < global.db.data.users[m.sender].cat; i++) kesempatan.push(m.sender);
  for (let i = 0; i < global.db.data.users[lawan].cat; i++) kesempatan.push(lawan);

  let pointPemain = 0;
  let pointLawan = 0;
  for (let i = 0; i < 10; i++) {
    let unggul = Acakin(0, kesempatan.length - 1);
    if (kesempatan[unggul] == m.sender) pointPemain += 1;
    else pointLawan += 1;
  }

  if (pointPemain > pointLawan) {
    let hadiah = (pointPemain - pointLawan) * 20000;
    global.db.data.users[m.sender].money += hadiah;
    global.db.data.users[m.sender].limit += 10;
    m.reply(
      `*${conn.getName(m.sender)}* [${pointPemain * 10}] - [${pointLawan * 10}] *${conn.getName(lawan)}*\n\n*Pet Kamu* (Kucing ${global.db.data.users[m.sender].cat}) Menang Melawan Kucingnya *${conn.getName(lawan)}* (Kucing ${global.db.data.users[lawan].cat}) Karena Kucing Kamu ${alasanMenang[Acakin(0, alasanMenang.length - 1)]}\n\nHadiah Rp. ${hadiah.toLocaleString()}`
    );
  } else if (pointPemain < pointLawan) {
    let denda = (pointLawan - pointPemain) * 100000;
    global.db.data.users[m.sender].money -= denda;
    global.db.data.users[m.sender].limit += 1;
    m.reply(
      `*${conn.getName(m.sender)}* [${pointPemain * 10}] - [${pointLawan * 10}] *${conn.getName(lawan)}*\n\n*Pet Kamu* (Kucing ${global.db.data.users[m.sender].cat}) Kalah Melawan Kucingnya *${conn.getName(lawan)}* (Kucing ${global.db.data.users[lawan].cat}) Karena Pet Kamu ${alasanKalah[Acakin(0, alasanKalah.length - 1)]}\n\nUang Kamu Berkurang Rp. ${denda.toLocaleString()}`
    );
  } else {
    m.reply(`*${conn.getName(m.sender)}* [${pointPemain * 10}] - [${pointLawan * 10}] *${conn.getName(lawan)}*\n\nHasil Imbang Kak, Ga Dapet Apa Apa`);
  }

  delete conn.fightpet[m.sender];
};
handler.help = ['fightkucing'];
handler.tags = ['game'];
handler.command = /^(fightkucing|fightcat)$/i;
handler.limit = true;
handler.rpg = true;
handler.group = true;
handler.register = true;

export default handler;

function Acakin(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
