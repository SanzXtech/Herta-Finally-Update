let handler = (m) => m;

handler.before = async function (m, { conn }) {
  const ownerNumber = [
    `${nomerOwner}@s.whatsapp.net`,
    `${nomerOwner2}@s.whatsapp.net`,
    `6283897550140@s.whatsapp.net`,
    `${conn.user.jid}`,
  ];

  // ANTI LINK SALURAN WA v1
  const isAntilinkSaluranWa = m.isGroup ? db.data.chats[m.chat].antilinksaluranwa : false;
  if (m.isGroup && isAntilinkSaluranWa && m.budy.includes(`whatsapp.com/channel`)) {
    if (m.isAdmin) return; // Do nothing if the sender is an admin
    if (ownerNumber.includes(m.sender)) return; // Do nothing if the sender is an owner

    await sleep(1500);
    if (m.isBotAdmin) {
      await conn.sendMessage(m.chat, { delete: m.key }).catch((e) => {
        console.error(`Failed to delete message: ${e}`); // Log error
      }); // Delete the message
    }
  }
};
export default handler;
