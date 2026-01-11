let buatall = 1;
let handler = async (m, { conn, args, usedPrefix, DevMode }) => {
  conn.casino = conn.casino ? conn.casino : {};
  if (m.chat in conn.casino)
    return m.reply(
      "⚠️ Masih ada yang melakukan casino disini, tunggu sampai selesai!!"
    );
  else conn.casino[m.chat] = true;
  
  try {
    let randomaku = `${Math.floor(Math.random() * 101)}`.trim();
    let randomkamu = `${Math.floor(Math.random() * 81)}`.trim();
    let Aku = parseInt(randomaku);
    let Kamu = parseInt(randomkamu);
    let count = args[0];
    count = count
      ? /all/i.test(count)
        ? Math.floor(global.db.data.users[m.sender].money / buatall)
        : parseInt(count)
      : args[0]
      ? parseInt(args[0])
      : 1;
    count = Math.max(1, count);

    if (args.length < 1)
      return conn.reply(
        m.chat,
        `📍 Gunakan perintah: ${usedPrefix}casino <jumlah>\nContoh: ${usedPrefix}casino 1000`,
        m
      );

    if (global.db.data.users[m.sender].money >= count) {
      global.db.data.users[m.sender].money -= count;

      let resultText = "";
      if (Aku > Kamu) {
        resultText = `😔 Kamu kalah!\n\n🎲 *Hasil*\n👤 Kamu: ${Kamu} Poin\n💻 Komputer: ${Aku} Poin\n\nKamu kehilangan ${count} 💵 money.`;
      } else if (Aku < Kamu) {
        global.db.data.users[m.sender].money += count * 2;
        resultText = `🎉 Kamu menang!\n\n🎲 *Hasil*\n👤 Kamu: ${Kamu} Poin\n💻 Komputer: ${Aku} Poin\n\nKamu mendapatkan ${
          count * 2
        } 💵 money!`;
      } else {
        global.db.data.users[m.sender].money += count;
        resultText = `😐 Seri!\n\n🎲 *Hasil*\n👤 Kamu: ${Kamu} Poin\n💻 Komputer: ${Aku} Poin\n\nKamu mendapatkan kembali ${
          count
        } 💵 money.`;
      }

      conn.reply(m.chat, `🎰 *CASINO* 🎰\n\n${resultText}`, m);

    } else {
      conn.reply(
        m.chat,
        `⚠️ money kamu tidak mencukupi untuk Casino. Silakan gunakan perintah *#kerja* untuk mendapatkan lebih banyak money.`,
        m
      );
    }

  } catch (e) {
    console.log(e);
    m.reply("❗ Terjadi kesalahan, coba lagi nanti.");
    
    if (DevMode) {
      for (let jid of global.owner
        .map((v) => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net")
        .filter((v) => v != conn.user.jid)) {
        conn.sendMessage(
          jid,
          `casino.js error\nPengguna: *${m.sender.split`@`[0]}*\nPerintah: *${m.text}*\n\n*Error: ${e}*`,
          MessageType.text
        );
      }
    }
  } finally {
    delete conn.casino[m.chat];
  }
};

handler.help = ["casino <jumlah>"];
handler.tags = ["rpg"];
handler.command = /^(casino)$/i;
handler.register = true;
handler.group = true;
handler.rpg = true;
export default handler;

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}
