let handler = async (m, { conn, args, setReply }) => {
  if (!m.isGroup) return setReply(mess.only.group)
  if (!m.isAdmin && !m.isOwner) return setReply(mess.only.admin)

  let group = await conn.groupMetadata(m.chat)
  let teks = `⚠️ *Warn List for group: ${group.subject}*\n\n`
  for (let participant of group.participants) {
    const id = participant.id
    const user = db.data.users[id] || {}
    const warn = user.warning || 0
    teks += `• @${id.split('@')[0]} : ${warn}/5\n`
  }
  setReply(teks)
}

handler.help = ['cekwarngroup']
handler.tags = ['group']
handler.command = ['cekwarngroup','cekwarn']
handler.group = true
handler.admin = true

export default handler
