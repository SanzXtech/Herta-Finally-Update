import ms from "parse-ms";

import _data from "../../lib/totalcmd.js"
let handler = async (m, { conn, setReply, isOwner }) => {
  const DataId = db.data.data
  if (!isOwner && !_data.checkDataId("reseller", m.sender, DataId)) return setReply(mess.only.ownerB)
  let premiumUsers = Object.entries(db.data.users).filter(([id, user]) => user.premiumTime && (user.premiumTime === Infinity || user.premiumTime > Date.now()));
  let premiumCount = premiumUsers.length;

  let txt = `╭──❑「 *📋 PREMIUM USERS LIST* 」❑──\n`;
  txt += `│ 👑 *Total Premium Users:* ${premiumCount}\n`;
  txt += `╰❑───────────────────────❑\n\n`;

  for (let [id, user] of premiumUsers) {
    let isUnlimited = user.premiumTime === Infinity;

    txt += `╭─❖\n`;
    txt += `├👤 *Name:* ${user.name || "Unknown"}\n`;
    txt += `├📱 *Number:* wa.me/${id.split("@")[0] || "Unknown"}\n`;

    if (isUnlimited) {
      txt += `├⏳ *Remaining Time:* Unlimited\n`;
    } else {
      let remainingTime = user.premiumTime - Date.now();
      let cekvip = ms(remainingTime);
      let cekbulan = Math.max(0, Math.floor(cekvip.days / 30));
      let cekhari = Math.max(0, cekvip.days % 30);
      txt += `├⏳ *Remaining Time:* ${cekbulan} Months ${cekhari} Days ${cekvip.hours} Hours ${cekvip.minutes} Minutes\n`;
    }

    txt += `╰❖───────────────────────❖\n\n`;
  }

  txt += `© Sanz X Herta`;
  setReply(txt);
};

handler.help = ["premlist"];
handler.tags = ["info"];
handler.command = /^(listprem|premlist)$/i;


export default handler;
