import _spam from "../../lib/antispam.js";
let handler = (m) => m;

handler.before = async function (m, { conn }) {
  const AntiSpam = db.data.antispam;

  // Cek jika pesan hanya mengandung kata "bot"
  if (m.budy.toLowerCase().trim() === "bot") {
    // Cek antispam untuk menghindari spam
    if (_spam.check("BotCall", m.senderNumber, AntiSpam)) return;
    _spam.add("BotCall", m.senderNumber, "10s", AntiSpam);

    // Kirim respon
    m.reply(`*BOT AKTIF KOK KAK 😉*\n\nada yang bisa aku bantu? aku di sini siap untuk membantu. 😊`);
  }

  // Cek jika pesan mengandung "ualaikum" atau "u'alaikum" untuk respon salam
  if (m.budy.includes("ualaikum") || m.budy.includes("u'alaikum")) {
    if (_spam.check("NotCase", m.senderNumber, AntiSpam)) return;
    _spam.add("NotCase", m.senderNumber, "10s", AntiSpam);
    m.reply("Walaikumsalam kak");
  }
};

export default handler;
