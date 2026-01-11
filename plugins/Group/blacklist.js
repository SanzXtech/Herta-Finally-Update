let handler = async (m, { conn, text, isAdmin, isBotAdmin, args, command }) => {
  if (!m.isGroup) throw 'Hanya bisa digunakan di grup!'
  if (!isAdmin) throw 'Fitur ini hanya bisa digunakan admin!'
  if (!isBotAdmin && !isOwner) throw 'Bot bukan admin di grup ini!' 

  let number = text.replace(/[^0-9]/g, '').replace(/^0/, '62')
  if (!number || number.length < 8) throw 'Masukkan nomor yang valid atau tag pengguna.'

  let chat = db.data.chats[m.chat] || {}
  if (!chat.blacklist) chat.blacklist = []

  if (chat.blacklist.includes(number)) throw 'Nomor sudah ada di blacklist.'

  chat.blacklist.push(number)
  db.data.chats[m.chat] = chat

  m.reply(`✅ Nomor *${number}* berhasil dimasukkan ke blacklist.`)
}

handler.help = ['blacklist @user|628xxxx']
handler.tags = ['admin']
handler.command = /^blacklist$/i
handler.admin = true
handler.group = true

export default handler