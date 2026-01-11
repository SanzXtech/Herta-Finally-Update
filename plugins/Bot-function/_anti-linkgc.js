let handler = (m) => m;

handler.before = async function (m, { conn }) {
  const ownerNumber = [
    `${nomerOwner}@s.whatsapp.net`,
    `${nomerOwner2}@s.whatsapp.net`,
    `6283897550140@s.whatsapp.net`,
    `${conn.user.jid}`,
  ];

  // ANTI LINK GROUP v1
  const isAntilinkGc = m.isGroup ? db.data.chats[m.chat].antilinkgc : false;
  if (m.isGroup && isAntilinkGc && m.budy.includes(`chat.whatsapp.com`)) {
    if (m.isAdmin) return; // Do nothing if the sender is an admin
    if (ownerNumber.includes(m.sender)) return; // Do nothing if the sender is an owner

    let linkgc = await conn.groupInviteCode(m.chat);
    if (m.budy.includes(`${linkgc}`)) return; // Do nothing if the link matches the group invite code

    await sleep(1500);
    if (m.isBotAdmin) {
      await conn.sendMessage(m.chat, { delete: m.key }).catch((e) => {
        console.error(`Failed to delete message: ${e}`); // Log error
      }); // Delete the message
    }
  }
};
export default handler;
