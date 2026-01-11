let handler = (m) => m;

handler.before = async function (m, { conn }) {
  const ownerNumber = [
    `${nomerOwner}@s.whatsapp.net`,
    `${nomerOwner2}@s.whatsapp.net`,
    `6283897550140@s.whatsapp.net`,
    `${conn.user.jid}`,
  ];

  // ANTI LINK SALURAN WA v2
  const isAntilinkSaluranWaV2 = m.isGroup ? db.data.chats[m.chat].antilinksaluranwav2 : false;
  if (m.isGroup && isAntilinkSaluranWaV2 && m.budy.includes(`whatsapp.com/channel`)) {
    if (m.isAdmin) return; // Do nothing if the sender is an admin
    if (ownerNumber.includes(m.sender)) return; // Do nothing if the sender is an owner

    await sleep(1500);
    if (m.isBotAdmin) {
      await conn.sendMessage(m.chat, { delete: m.key }); // Delete the message
      await conn.groupParticipantsUpdate(m.chat, [m.sender], "remove").catch((e) => {
        console.error(`Failed to remove participant: ${e}`); // Log error
      }); // Remove the user
    }
  }
};
export default handler;
