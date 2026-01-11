const rewards = {
  exp: 50,
  money: 250,
};
const cooldown = 3600000; // 1 hour
let handler = async (m) => {
  let user = global.db.data.users[m.sender];
  if (new Date() - (user.lasthourly || 0) < cooldown)
    return m.reply(
      `You have already claimed *hourly rewards*, please wait until cooldown finish.\n\n⏱️ ${(user.lasthourly + cooldown - new Date()).toTimeString()}`.trim()
    );
  let text = "";
  for (let reward of Object.keys(rewards)) {
    if (!(reward in user)) continue;
    let amount = rewards[reward];
    if (user.premium) amount = Math.floor(amount * 1.5);
    user[reward] += amount;
    text += `➠ ${global.rpg.emoticon(reward)} ${reward}: ${amount}\n`;
  }
  m.reply(`🔖 Hourly reward received :\n${text}`.trim());
  user.lasthourly = new Date() * 1;
};
handler.help = ["hourly"];
handler.tags = ["rpg"];
handler.command = /^(hourly)$/i;
handler.register = true;
handler.group = true;
handler.cooldown = cooldown;
handler.rpg = true;
export default handler;
