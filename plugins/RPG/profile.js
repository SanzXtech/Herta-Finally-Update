import ms from "parse-ms";

let handler = async (m, { conn, setReply, isPremium, isOwner }) => {
  const user = global.db.data.users[m.sender];
  const chat = global.db.data.chats[m.chat];

  const userLevel = user?.level || 0;
  const userExp = user?.exp || 0;
  const requiredExp = userLevel === 0 ? 500 : 1000 * userLevel;
  const userPersen = (userExp / requiredExp) * 100;
  const userVerified = user?.date || false;

  const pp = await conn.profilePictureUrl(m.sender, "image").catch(() => "https://telegra.ph/file/ee60957d56941b8fdd221.jpg");

  let contextInfo = {
    externalAdReply: {
      showAdAttribution: false,
      title: "P R O F I L E",
      body: "Check Your Stats",
      mediaType: 1,
      renderLargerThumbnail: true,
      thumbnailUrl: pp,
    }
  };

  const { userXp, userLeveling } = await import("../../lib/user.js");

  let stst = "";
  try {
    const sol = await conn.fetchStatus(m.sender);
    stst = sol?.status || "";
  } catch { }

  // Fungsi untuk format waktu premium
  const formatPremiumTime = () => {
    if (user.premiumTime === Infinity) return "♾️ *Permanent*";
    if (user.premiumTime > Date.now()) {
      let cekvip = ms(user.premiumTime - Date.now());
      return `⏳ ${cekvip.days} Hari ${cekvip.hours} Jam ${cekvip.minutes} Menit`;
    }
    return "❌ *Not Premium*";
  };

  let teks = `––––––『 *👤 PROFILE USER* 』––––––

🆔 *Nama:* ${m.pushname}
💳 *Saldo:* Rp ${user.money.toLocaleString()}
✅ *Verified:* ${userVerified ? '✔️ Ya' : '❌ Belum'}
📇 *Status:* ${isPremium ? '⭐ Premium' : 'Free'}
🧬 *Level:* ${userLevel}
🔰 *Grade:* ${userLeveling(userLevel)}
⚡ *Exp:* ${userXp(userPersen)} (${Math.floor(userPersen)}%)
♻️ *Total Exp:* ${userExp}/${requiredExp}
📟 *User Hit:* ${user.hit}
🤖 *Status Bot:* ${isOwner ? '👑 Owner' : '👤 User'}
🕔 *Expired:* ${formatPremiumTime()}
📉 *Limit:* ${isPremium ? '♾️ Unlimited' : `${user.limit}/${limitCount}`}
📲 *Nomor:* wa.me/${m.sender.split("@")[0]}
🧸 *Bio:* ${stst}`;

  conn.sendMessage(m.chat, { contextInfo, text: teks }, { quoted: m });
};

handler.tags = ["info"];
handler.command = ["profile", "me"];
export default handler;