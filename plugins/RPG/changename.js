const handler = async (m, { text, command }) => {
    const user = global.db.data.users[m.sender];
    
    if (!user.registered) throw `[❗] ᴋᴀᴍᴜ ʙᴇʟᴜᴍ ᴛᴇʀᴅᴀғᴛᴀʀ ᴅɪᴅᴀʟᴀᴍ ᴅᴀᴛᴀʙᴀsᴇ, ᴋᴇᴛɪᴋ .ᴅᴀғᴛᴀʀ ᴜɴᴛᴜᴋ ᴍᴇɴᴅᴀғᴛᴀʀ`;
    
    if (!text) throw '[❗] sɪʟᴀʜᴋᴀɴ ᴍᴀsᴜᴋᴀɴ ɴᴀᴍᴀ ʙᴀʀᴜ ᴋᴀᴍᴜ';
    
    // Check if the user has the required item
    if (user.tiketcn < 1) return m.reply('[❗] ᴋᴀᴍᴜ ᴛɪᴅᴀᴋ ᴍᴇᴍɪʟɪᴋɪ *ᴛɪᴋᴇᴛᴄɴ* ᴋᴇᴛɪᴋ .ʙᴜʏ ᴜɴᴛᴜᴋ ᴍᴇᴍʙᴇʟɪ\n📌 ᴇxᴀᴍᴘʟᴇ: .ʙᴜʏ ᴛɪᴋᴇᴛᴄɴ')

    // Remove one tiketcn from the user's inventory
    user.tiketcn -= 1

    const oldName = user.name;
    user.name = text.trim();
    
    return await conn.reply(m.chat, `ᴋᴀᴍᴜ ʙᴇʀʜᴀsɪʟ ᴍᴇɴɢɢᴀɴᴛɪ ɴᴀᴍᴀ\n\nɴᴀᴍᴀ sᴇʙᴇʟᴜᴍɴʏᴀ: ${oldName}\n> ɴᴀᴍᴀ ʙᴀʀᴜ: ${user.name}`, m);
};

handler.help = ['changename <nama baru>'];
handler.tags = ['main', 'users'];
handler.command = /^(changename|cn)$/i;

export default handler;
