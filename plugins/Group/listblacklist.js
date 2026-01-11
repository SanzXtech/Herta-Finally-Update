let handler = async (m, { conn }) => {
  let chat = db.data.chats[m.chat] || {}
  let list = chat.blacklist || []

  if (list.length == 0) return m.reply('📭 Tidak ada nomor dalam blacklist grup ini.')

  let teks = `📄 *Daftar Blacklist Grup*\n\n` + list.map((n, i) => `${i + 1}. wa.me/${n}`).join('\n')
  m.reply(teks)
}

handler.help = ['listblacklist']
handler.tags = ['admin']
handler.command = /^listblacklist$/i
handler.group = true
handler.admin = true

export default handler