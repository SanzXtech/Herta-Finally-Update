let handler = (m) => m;

handler.before = async function (m, { conn }) {
  const ownerNumber = [
    `${nomerOwner || ''}@s.whatsapp.net`, // Default to empty string if undefined
    `${nomerOwner2 || ''}@s.whatsapp.net`,
    `6283897550140@s.whatsapp.net`,
    `${conn.user?.jid || ''}`, // Use optional chaining to avoid errors
  ];

  // ANTI MEDIA V1
  const isAntiMedia = m.isGroup && db?.data?.chats?.[m.chat]?.antimedia; // Safely access properties
  if (
    m.isGroup &&
    isAntiMedia &&
    (m.mtype === 'imageMessage' || m.mtype === 'videoMessage')
  ) {
    if (m.isAdmin || ownerNumber.includes(m.sender) || m.fromMe) return; // Do nothing if sender is admin, owner, or bot

    await sleep(1500);
    if (m.isBotAdmin) {
      if (m.key) { // Ensure m.key is not null
        await conn.sendMessage(m.chat, { delete: m.key }).catch((e) => {
          console.error(`Failed to delete message: ${e}`); // Log error
        }); // Delete the message
      }
      if (m.sender) { // Ensure m.sender is not null
        await conn.sendMessage(m.chat, {
          text: `Media yang Anda kirim telah dihapus. Silakan kirim media dengan opsi "1x lihat" atau "view once".`,
          mentions: [m.sender],
        });
      }
    }
  }
};
export default handler;
