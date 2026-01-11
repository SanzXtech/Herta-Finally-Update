let handler = async (m, { conn, args, setReply }) => {
  if (!args || !args[0]) return setReply('Masukan nomor user atau link/id group untuk di-unwarn')
  const q = args.join(' ')
  // If link
  if (q.includes('chat.whatsapp.com')) {
    try {
      const rex1 = /chat.whatsapp.com\/([\w\d]*)/g;
      const kode = q.match(rex1)[0].replace('chat.whatsapp.com/','')
      const info = await conn.groupGetInviteInfo(kode)
      const gid = info.id
      // reset warn for group members
      const metadata = await conn.groupMetadata(gid).catch(_=>null)
      if (!metadata) return setReply('Gagal mendapatkan metadata group')
      for (let p of metadata.participants) {
        if (db.data.users[p.id]) db.data.users[p.id].warning = 0
      }
      return setReply(`Berhasil reset warn untuk group ${metadata.subject}`)
    } catch (e) {
      return setReply('Link group invalid')
    }
  }

  // If provided id or number
  const idCandidate = q.includes('@')? q : q.replace(/[^0-9]/g,'')
  const jid = idCandidate.includes('@')? idCandidate : idCandidate + '@s.whatsapp.net'
  if (!db.data.users[jid]) return setReply('User tidak ditemukan di database')
  db.data.users[jid].warning = 0
  setReply(`Berhasil unwarn user wa.me/${jid.split('@')[0]}`)
}

handler.help = ['unwarn <nomor|link|idgroup>']
handler.tags = ['owner']
handler.command = /^(unwarn)$/i
handler.owner = true

export default handler
