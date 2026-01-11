import fs from 'fs/promises';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const handler = async (m, { conn, args }) => {
  const chatID = m.chat;
  const sender = m.sender;
  const groupInfo = await conn.groupMetadata(chatID);
  const participants = groupInfo.participants;
  const groupName = groupInfo.subject;

  const baseName = args[0] || 'member';
  let vcard = '';
  let count = 1;

  for (let participant of participants) {
    if (participant.id && participant.id.includes('@s.whatsapp.net')) {
      const nomor = participant.id.split("@")[0];
      vcard += `BEGIN:VCARD\nVERSION:3.0\nFN:${baseName} [${count}]\nTEL;type=CELL;type=VOICE;waid=${nomor}:+${nomor}\nEND:VCARD\n`;
      count++;
    }
  }

  if (count === 1) return m.reply('Tidak ada kontak yang bisa disimpan.');

  const fileName = './contacts.vcf';
  await fs.writeFile(fileName, vcard.trim());

  await sleep(1000);
  await conn.sendMessage(sender, {
    document: await fs.readFile(fileName),
    mimetype: 'text/vcard',
    fileName: 'Contacts.vcf',
    caption: `📇 Daftar kontak dari grup *${groupName}*\n👥 Total member: ${count - 1}`
  }, { quoted: m });

  await fs.unlink(fileName);

  // Kirim pesan konfirmasi di grup
  m.reply(`📤 Kontak berhasil dikirim ke owner\n👥 Total member: ${count - 1}`);
};

handler.help = ['savekontak <nama>'];
handler.tags = ['pushkontak'];
handler.command = ['savekontak'];
handler.group = true;
handler.owner = true;

export default handler;