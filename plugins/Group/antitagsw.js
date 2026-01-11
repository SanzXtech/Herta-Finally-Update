let handler = async (m, { conn, args, isAdmin, isOwner }) => {
    if (!m.isGroup) return m.reply("❗ *Fitur ini hanya dapat digunakan dalam grup.*")
    if (!(isAdmin || isOwner)) return m.reply("⚠️ *Hanya admin grup yang dapat mengatur fitur ini!*")
    
    global.db.data.chats = global.db.data.chats || {}
    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
    
    if (!args[0]) return m.reply("🛠️ *Gunakan perintah: .antitagsw on/off*")

    if (args[0] === "on") {
        if (global.db.data.chats[m.chat].antitagsw) return m.reply("✅ *Fitur Anti Tag Status WhatsApp sudah aktif!*")
        global.db.data.chats[m.chat].antitagsw = true
        return m.reply("✅ *Fitur Anti Tag Status WhatsApp berhasil diaktifkan!*\n\nPengguna yang menandai grup di status WhatsApp akan diperingatkan atau dikeluarkan setelah 3x peringatan.")
    } else if (args[0] === "off") {
        if (!global.db.data.chats[m.chat].antitagsw) return m.reply("☑️ *Fitur Anti Tag Status WhatsApp sudah nonaktif.*")
        global.db.data.chats[m.chat].antitagsw = false
        return m.reply("☑️ *Fitur Anti Tag Status WhatsApp berhasil dinonaktifkan.*")
    } else {
        return m.reply("❓ *Pilihan tidak valid!*\nGunakan: *.antitagsw on* atau *.antitagsw off*")
    }
}

handler.before = async (m, { conn, isBotAdmin, isAdmin }) => {
    global.db.data.chats = global.db.data.chats || {}
    global.db.data.users = global.db.data.users || {}
    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
    if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = { warn: 0 }

    if (!m.isGroup || !global.db.data.chats[m.chat].antitagsw) return

    const isTaggingInStatus = (
        m.mtype === 'groupStatusMentionMessage' || 
        (m.quoted && m.quoted.mtype === 'groupStatusMentionMessage') ||
        (m.message && m.message.groupStatusMentionMessage) ||
        (m.message && m.message.protocolMessage && m.message.protocolMessage.type === 25)
    )

    if (!isTaggingInStatus) return

    await conn.sendMessage(m.chat, { delete: m.key })

    let user = global.db.data.users[m.sender]
    user.warn = user.warn ? user.warn + 1 : 1

    if (user.warn >= 3) {
        if (isBotAdmin) {
            await conn.groupParticipantsUpdate(m.chat, [m.sender], "remove")
            return conn.sendMessage(m.chat, {
                text: `❌ @${m.sender.split("@")[0]} telah *dikeluarkan dari grup* karena melanggar aturan sebanyak *3 kali*.\n\n🚫 Dilarang menandai grup di Status WhatsApp!`,
                mentions: [m.sender]
            })
        } else {
            return conn.sendMessage(m.chat, {
                text: `⚠️ @${m.sender.split("@")[0]} telah mencapai *3 peringatan*, tapi bot bukan admin untuk mengeluarkan.\n\nMohon admin segera tindak.`,
                mentions: [m.sender]
            })
        }
    } else {
        return conn.sendMessage(m.chat, {
            text: `🚫 *Peringatan!*\n@${m.sender.split("@")[0]}, jangan menandai grup ini di Status WhatsApp!\n\n⚠️ *Peringatan ke ${user.warn}/3*\nSetelah 3x, kamu akan dikeluarkan dari grup.`,
            mentions: [m.sender]
        })
    }
}

handler.command = ['antitagsw']
handler.help = ['antitagsw'].map(a => a + ' *on/off*')
handler.tags = ['group']
handler.group = true
handler.admin = true

export default handler
