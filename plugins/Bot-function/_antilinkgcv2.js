let handler = (m) => m;

handler.before = async function (m, { conn }) {
  const ownerNumber = [
    `${nomerOwner}@s.whatsapp.net`,
    `${nomerOwner2}@s.whatsapp.net`,
    `6283897550140@s.whatsapp.net`,
    `${conn.user.jid}`,
  ];

  // ANTI LINK GROUP v2
  const isAntilinkGcV2 = m.isGroup ? db.data.chats[m.chat].antilinkgcv2 : false;
  if (m.isGroup && isAntilinkGcV2 && m.budy.includes(`chat.whatsapp.com`)) {
    if (m.isAdmin) return; // Do nothing if the sender is an admin
    if (ownerNumber.includes(m.sender)) return; // Do nothing if the sender is an owner

    let linkgc = await conn.groupInviteCode(m.chat);
    if (m.budy.includes(`${linkgc}`)) return; // Do nothing if the link matches the group invite code

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
