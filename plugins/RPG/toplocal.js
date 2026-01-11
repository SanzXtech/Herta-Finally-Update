let handler = async (m, { conn, participants }) => {
	conn.sendMessage(m.chat, {
		react: {
			text: '🕒',
			key: m.key,
		}
	});
	let member = participants.map(u => u.id);
	let kontol = {};
	for (let i = 0; i < member.length; i++) {
		if (typeof global.db.data.users[member[i]] != 'undefined' && member[i] != conn.user.jid && member[i] != conn.user.jid.split('@')[0] + '@s.whatsapp.net') {
			kontol[member[i]] = {
				money: global.db.data.users[member[i]].money,
				level: global.db.data.users[member[i]].level,
				limit: global.db.data.users[member[i]].limit
			};
		}
	}
	let money = Object.entries(kontol).sort((a, b) => b[1].money - a[1].money);
	let limit = Object.entries(kontol).sort((a, b) => b[1].limit - a[1].limit);
	let rankmoney = money.map(v => v[0]);
	let rankLimit = limit.map(v => v[0]);
	let ismoney = Math.min(10, money.length);
	let isLimit = Math.min(10, limit.length);

	let teks = `*[ 🚩 ] T O P - L O C A L*\n`;
	teks += `*[ 🏆 ] You : ${rankmoney.indexOf(m.sender) + 1}* of *${member.length}*\n`;
	teks += `*[ 🔥 ] Group :* ${await conn.getName(m.chat)}\n\n`;

	let mentionedJid = [];
	teks += await Promise.all(money.slice(0, ismoney).map(async ([user, data], i) => {
		let username = await conn.getName(user);
		mentionedJid.push(user); // Add user to mentionedJid
		return `${i + 1}. @${user.split`@`[0]}\n   ◦  Money: ${formatNumber(data.money)}\n   ◦  *Level️ : ${data.level}*`;
	})).then(res => res.join('\n'));

	teks += `\n\n© Herta-V2`;

	// Send message with the mentionedJid
	conn.sendMessage(m.chat, { text: teks, mentions: mentionedJid });
};

handler.command = /^toplokal|toplocal$/i;
handler.tags = ["main"];
handler.help = ["toplocal"];
handler.register = true;
handler.group = true;

export default handler;

function formatNumber(num) {
	let formatted = num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
	return formatted;
  }
