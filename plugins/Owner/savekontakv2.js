import fs from 'fs/promises';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const handler = async (m, { conn, args }) => {
  const idgroup = args[0];
  const sender = m.sender;

  if (!idgroup || !idgroup.endsWith('@g.us')) {
    return m.reply('Mohon berikan ID grup dengan format yang benar.\nContoh: `.savekontakv2 120xxxxx@g.us`');
  }

  const groupInfo = await conn.groupMetadata(idgroup).catch(() => null);
  if (!groupInfo) return m.reply('Gagal mengambil metadata grup. Pastikan bot masih ada di grup tersebut.');

  const participants = groupInfo.participants;
  const groupName = groupInfo.subject;

  let vcard = '';
  let count = 1;

  for (let participant of participants) {
    if (participant.id && participant.id.includes('@s.whatsapp.net')) {
      const nomor = participant.id.split("@")[0];
      vcard += `BEGIN:VCARD\nVERSION:3.0\nFN:member [${count}]\nTEL;type=CELL;type=VOICE;waid=${nomor}:+${nomor}\nEND:VCARD\n`;
      count++;
    }
  }

  if (count === 1) return m.reply('Tidak ada kontak yang dapat disimpan.');

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

  m.reply(`📤 Kontak dari grup berhasil dikumpulkan dan telah dikirim langsung ke inbox owner.\nSilakan cek pesan pribadi Anda!`);
};

handler.help = ['savekontakv2 <idgroup>'];
handler.tags = ['pushkontak'];
handler.command = ['savekontakv2'];
handler.mods = true;

export default handler;