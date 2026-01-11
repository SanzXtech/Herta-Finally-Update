import _spam from "../../lib/antispam.js"
let handler = async (m, { conn, args, setReply }) => {
  if (!args || !args[0]) return setReply('Usage: .antispam add|del|list <target> <time>\ntarget: @user | groupLink | groupId')
  const cmd = args[0].toLowerCase()
  if (cmd === 'list') {
    const list = db.data.antispam || []
    if (!list.length) return setReply('No antispam entries')
    let txt = 'Antispam entries:\n'
    for (let i of list) txt += `• ${i.name} -> ${i.id} (expires: ${i.expired})\n`
    return setReply(txt)
  }
  if (cmd === 'add') {
    if (!args[1]) return setReply('Target missing')
    if (!args[2]) return setReply('Duration missing (e.g. 3s, 10s, 30s, 30m or PERMANENT)')
    const target = args[1]
    const duration = args[2]
    // support group invite link
    if (target.includes('chat.whatsapp.com')) {
      try {
        const rex1 = /chat.whatsapp.com\/([\w\d]*)/g;
        const kode = target.match(rex1)[0].replace('chat.whatsapp.com/','')
        const info = await conn.groupGetInviteInfo(kode)
        _spam.add('lid', info.id, duration, db.data.antispam)
        return setReply('Sukses menambahkan group ke antispam')
      } catch (e) {
        return setReply('Invalid group link')
      }
    }
    // target @user or number
    const jid = target.includes('@')? target : target.replace(/[^0-9]/g,'') + '@s.whatsapp.net'
    _spam.add('jid', jid, duration, db.data.antispam)
    return setReply('Sukses menambahkan user ke antispam')
  }
  if (cmd === 'del') {
    if (!args[1]) return setReply('Target missing')
    const target = args[1]
    const jid = target.includes('@')? target : target.replace(/[^0-9]/g,'') + '@s.whatsapp.net'
    _spam.del(jid, db.data.antispam)
    return setReply('Sukses menghapus antispam entry')
  }
}
handler.help = ['antispam add/del/list']
handler.tags = ['owner']
handler.command = ['antispam','antispamban']
handler.owner = true

export default handler
