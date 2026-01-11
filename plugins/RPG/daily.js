const rewards = {
  exp: 9999,
  money: 4999,
  potion: 5,
};
const cooldown = 86400000; // 24 hours
let handler = async (m, { usedPrefix }) => {
  let user = global.db.data.users[m.sender];

  if (new Date() - (user.lastdaily || 0) < cooldown)
    return m.reply(
      `You have already claimed *daily rewards*, please wait until cooldown finish.\n\n⏱️ ${(user.lastdaily + cooldown - new Date()).toTimeString()}`.trim()
    );
  let text = "";
  for (let reward of Object.keys(rewards)) {
    if (!(reward in user)) continue;
    let amount = rewards[reward];
    if (user.premium) amount = Math.floor(amount * 1.5);
    user[reward] += amount;
    text += `➠ ${global.rpg.emoticon(reward)} ${reward}: ${amount}\n`;
  }
  m.reply(
    `🔖 Daily reward received :\n${text}`.trim()
  );
  user.lastdaily = new Date() * 1;
};
handler.help = ["daily"];
handler.tags = ["rpg"];
handler.command = /^(daily)$/i;

handler.register = true;
handler.group = true;
handler.cooldown = cooldown;
handler.rpg = true;
export default handler;
