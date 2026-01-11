import fs from 'fs';
let handler = async (m, { text, q, conn, isOwner, setReply }) => {
  if (!isOwner && !m.itsMe) return setReply(mess.only.owner);
  let bot = db.data.others["restart"];
  if (bot) {
    db.data.others["restart"].m = m;
    db.data.others["restart"].from = m.chat;
  } else {
    db.data.others["restart"] = {
      m: m,
      from: m.chat,
    };
  }

  const thumbnail = fs.readFileSync('./media/alert.png'); // Path lokal untuk thumbnail
  const footerText = "🔔 Bot sedang restart, harap tunggu beberapa saat.";

  await conn.sendMessage(m.chat, { 
    text: `_Restarting server..._`,
    contextInfo: {
      externalAdReply: {
        title: "🔄 Restarting Bot",
        body: footerText,
        thumbnail: thumbnail,
        sourceUrl: "https://sanzonly.id"
      }
    }
  });

  await sleep(1000);
  process.send("reset");
};
handler.help = ["resest"];
handler.tags = ["check"];
handler.command = /^(reset|restart|res)$/i;
handler.owner = true;
export default handler;
