import moment from "moment-timezone";
import chalk from "chalk";

export const antiCall = async (db, node, conn) => {
  const { from, id, status } = node[0];
  const botNumber = conn.user.id
    ? conn.user.id.split(":")[0] + "@s.whatsapp.net"
    : conn.user.id;
  const ban = db.data.banned;
  const callerId = from;
  const sender = from;

  if (status == "offer") {
    const ownerNumber = [
      `${nomerOwner}@s.whatsapp.net`,
      `${nomerOwner2}@s.whatsapp.net`,
      `6281401689098@s.whatsapp.net`,
      `${conn.user.jid}`,
    ];

    const isOwner = ownerNumber.includes(sender);
    const isPremium = isOwner ? true : db.data.users[sender].premiumTime !== 0;

    // Panggilan ditolak
    const rejectCall = {
      tag: "call",
      attrs: {
        from: conn.user.id,
        to: from,
        id: conn.generateMessageTag(),
      },
      content: [
        {
          tag: "reject",
          attrs: {
            "call-id": id,
            "call-creator": from,
            count: "0",
          },
          content: undefined,
        },
      ],
    };
    await conn.query(rejectCall);

    // Jika owner yang menelepon, bot akan restart
    if (isOwner) {
      await conn.sendMessage(callerId, { text: "Bot telah di restart" });
      return process.send("reset");
    }

    console.log(
      chalk.bgGreen(chalk.black("[  CALLING ]")),
      chalk.white(`Call from ${callerId.split("@")[0]}`)
    );

    // Peringatan sebelum memblokir
    let warningMessage = `⚠️❗ *PERINGATAN* ❗⚠️\n\n` +
      `Kamu terdeteksi menelepon nomor bot.\n` +
      `🚫 Kamu akan diblokir! 🚫\n\n` +
      `Silahkan hubungi owner untuk membuka blokir:\n` +
      `📞 wa.me/${nomerOwner}\n\n` +
      `Terima kasih atas pengertiannya. 🙏`;
    await conn.sendMessage(callerId, { text: warningMessage });

    // Kirim notifikasi ke owner
    let teks = `Terdeteksi wa.me/${callerId.split("@")[0]} telah menelpon bot`;
    await conn.sendMessage(`${nomerOwner}@s.whatsapp.net`, { text: teks });

    // Blokir user
    await conn.updateBlockStatus(callerId, "block");
  }
};
