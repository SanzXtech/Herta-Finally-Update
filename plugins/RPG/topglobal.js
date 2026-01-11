function formatmoney(money) {
  const suffixes = ['', 'k', 'm', 'b', 't', 'q', 'Q', 's', 'S', 'o', 'n', 'd', 'U', 'D', 'Td', 'qd', 'Qd', 'sd', 'Sd', 'od', 'nd', 'V', 'Uv', 'Dv', 'Tv', 'qv', 'Qv', 'sv', 'Sv', 'ov', 'nv', 'T', 'UT', 'DT', 'TT', 'qt', 'QT', 'st', 'ST', 'ot', 'nt'];
  const suffixIndex = Math.floor(Math.log10(money) / 3);
  const suffix = suffixes[suffixIndex];
  const scaledmoney = money / Math.pow(10, suffixIndex * 3);
  return scaledmoney.toFixed(2) + suffix;
}

let handler = async (m, { conn }) => {
  conn.sendMessage(m.chat, {
    react: {
      text: '✅',
      key: m.key,
    }
  });

  // Ambil data semua user dari database
  let money = Object.entries(global.db.data.users).sort((a, b) => b[1].money - a[1].money);
  let getUser = money.map(v => v[0]);
  let show = Math.min(10, money.length);
  let rankmoney = money.map(([user, data]) => user);

  let teks = `[ 🌐 ] *T O P - G L O B A L*\n`;
  teks += `[ 🏆 ] *You:* *${rankmoney.indexOf(m.sender) + 1}* of *${getUser.length}*\n\n`;

  let mentionedJid = []; // Array untuk menyimpan user yang disebutkan
  teks += await Promise.all(money.slice(0, show).map(async ([user, data], i) => {
    let username = await conn.getName(user);
    mentionedJid.push(user); // Tambahkan user ke array mentionedJid
    return `${i + 1}. @${user.split`@`[0]}\n   ◦ *Money* : *${formatmoney(data.money)}*\n   ◦ *Level* : *${data.level}*`;
  })).then(res => res.join('\n'));

  teks += `\n\n© herta-V2`;

  // Kirim pesan dengan menyebutkan user yang relevan
  conn.sendMessage(m.chat, { text: teks, mentions: mentionedJid });
};

handler.command = ["topglobal"];
handler.tags = ["main"];
handler.help = ["topglobal"];
handler.register = true;

export default handler;
