import schedule from 'node-schedule'
import moment from 'moment-timezone'
import toMs from 'ms'

const handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!m.isGroup) throw '❗ Perintah ini hanya untuk di dalam grup!';

  const target = m.mentionedJid?.[0] || args[0];
  const duration = args[1];

  if (!target || !duration) throw `📌 Contoh penggunaan:
${usedPrefix + command} @user 10m

🕒 Format durasi:
• 1s = 1 detik
• 1m = 1 menit
• 1h = 1 jam
• 1d = 1 hari
`;

  const durationMs = toMs(duration);
  if (!durationMs) throw '⏰ Format durasi tidak valid! Contoh: 5m, 1h, 1d';

  const now = Date.now();
  const end = now + durationMs;
  const formattedEnd = moment(end).tz('Asia/Jakarta').format('LLLL');

  // Info jadwal kick
  await conn.sendMessage(m.chat, {
    text: `🕒 @${target.split('@')[0]} akan dikeluarkan dari grup pada:\n📅 *${formattedEnd}*`,
    mentions: [target]
  });

  // Jadwalkan kick
  schedule.scheduleJob(new Date(end), async () => {
    await conn.groupParticipantsUpdate(m.chat, [target], 'remove').catch(() => {});
    conn.sendMessage(m.chat, {
      text: `👢 Waktu habis! @${target.split('@')[0]} telah dikeluarkan dari grup.`,
      mentions: [target]
    });
  });
};

handler.help = ['trialkick @user <durasi>'];
handler.tags = ['group'];
handler.command = /^trialkick$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;