let handler = m => m

handler.before = async function (m, { conn, isFromMe, isOwner, isAdmin, participants }) {
  let user = global.db.data.users[m.sender]

  if (user.afk > -1) {
    m.reply(`
🎯 *AFK Mode Berakhir!*  
${user.afkReason ? `Alasan: _${user.afkReason}_` : ''}
🕒 *Durasi AFK:* ${(new Date - user.afk).toTimeString()}
`.trim())
    user.afk = -1
    user.afkReason = ''
  }

  let jids = [...new Set([...(m.mentionedJid || []), ...(m.quoted ? [m.quoted.sender] : [])])]

  for (let jid of jids) {
    let targetUser = global.db.data.users[jid]
    if (!targetUser) continue
    let afkTime = targetUser.afk
    if (!afkTime || afkTime < 0) continue
    let reason = targetUser.afkReason || ''

    // Cek jika yang menandai adalah owner, admin, atau bot
    if (isOwner || isAdmin || isFromMe) continue

    // Tambahkan sistem warning
    if (!user.warn) user.warn = 0
    user.warn += 1

    let warningMessage = `
🚨 *PERINGATAN!*
Jangan Tag User yang sedang AFK!  
📛 *Alasan AFK:* ${reason || 'Tanpa Alasan'}
🕒 *Durasi AFK:* ${(new Date - afkTime).toTimeString()}
⚠️ *Warning Anda:* ${user.warn}/5
`.trim()

    m.reply(warningMessage)

    // Hapus pesan jika bukan bot, pemilik, atau admin
    await conn.sendMessage(m.chat, { delete: m.key })

    // Kick user jika mencapai 5 warning
    if (user.warn >= 5) {
      await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
      user.warn = 0 // Reset warning setelah dikeluarkan
      m.reply(`🚫 *${m.name || 'User'}* telah dikeluarkan karena melanggar aturan (5/5 warning).`)
    }
  }
  return true
}

export default handler
