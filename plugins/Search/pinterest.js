const gis = require("g-i-s");

let handler = async (m, { conn, q, args, command, setReply }) => {
  if (!q) {
    return m.reply(
      `Kirim perintah *.${command} query*\natau\n*.${command} query --jumlah*\nContoh :\n*.${command} cecan*\natau\n*.${command} cecan --10*`
    );
  }

  m.reply(mess.wait);

  var jumlah;
  if (q.includes("--")) jumlah = q.split("--")[1];

  pinterest(q.replace("--" + jumlah, "")).then(async (data) => {
    if (q.includes("--")) {
      if (data.result.length < jumlah) {
        jumlah = data.result.length;
        m.reply(`Hanya ditemukan ${data.result.length}, foto segera dikirim`);
      }

      for (let i = 0; i < jumlah; i++) {
        setTimeout(() => {
          conn.sendMessage(m.chat, { image: { url: data.result[i] } });
        }, i * 3000); // 3000ms = 3 seconds delay for each iteration
      }
    } else {
      conn.sendMessage(
        m.chat,
        {
          caption: `Hasil pencarian dari ${q}`,
          image: { url: data.result[Math.floor(Math.random() * data.result.length)] },
        },
        { quoted: m }
      );
    }
  });
};

handler.help = ["pinterest"];
handler.tags = ["info"];
handler.command = /^(pinterest|pin)$/i;

export default handler;

async function pinterest(query) {
  return new Promise((resolve, reject) => {
    let err = { status: 404, message: "Terjadi kesalahan" };
    gis({ searchTerm: query + " site:id.pinterest.com" }, (er, res) => {
      if (er) return reject(err);
      let hasil = {
        status: 200,
        creator: "chibot",
        result: [],
      };
      res.forEach((x) => hasil.result.push(x.url));
      resolve(hasil);
    });
  });
}