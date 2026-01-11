const rewards = {
  exp: 5000,
  money: 50000,
  potion: 10,
};
const cooldown = 604800000;
let handler = async (m, { usedPrefix }) => {
  let user = global.db.data.users[m.sender];

  if (new Date() - (user.lastweekly || 0) < cooldown)
    return m.reply(
      `You have already claimed *weekly rewards*, please wait until cooldown finish.\n\n⏱️ ${(user.lastweekly + cooldown - new Date()).toTimeString()}`
    );
  let text = "";
  for (let reward of Object.keys(rewards)) {
    if (!(reward in user)) continue;

    let rewardAmount = rewards[reward];
    // Apply uniform premium bonus (50%)
    if (user.premium) rewardAmount = Math.floor(rewardAmount * 1.5);
    
    user[reward] += rewardAmount;
    text += `*+${rewardAmount}* ${global.rpg.emoticon(reward)} ${reward}\n`;
  }
  m.reply(text.trim());
  user.lastweekly = new Date() * 1;
};
handler.help = ["weekly"];
handler.tags = ["rpg"];
handler.command = /^(weekly)$/i;
handler.register = true;
handler.group = true;
handler.cooldown = cooldown;
handler.rpg = true;
export default handler;
