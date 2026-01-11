let handler = async (m, { conn, args }) => {
    if (!args || !args[0]) throw 'Siapa yang mau di-Warn?'

    // Cek database tersedia
    const db = global.db;
    if (!db || !db.data || !db.data.banned) throw '⚠️ Database tidak tersedia atau tidak valid!'

    // Cek mention atau nomor
    let mention = m.mentionedJid[0] || conn.parseMention(args[0]) || args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net'
    if (!mention || !mention.includes('@s.whatsapp.net')) throw '⚠️ Tag user atau masukkan nomor dengan benar!'

    // Pastikan user ada dalam database
    if (!(mention in db.data.users)) throw '❌ User tidak terdaftar dalam DATABASE!!'

    let user = db.data.users[mention]

    // Cek apakah pengguna sudah dibanned
    const ban = db.data.banned
    if (ban.some(b => b.id === mention.split('@')[0])) throw '⛔ User ini telah dibanned sebelumnya!'

    // Menentukan jumlah warning
    let count = parseInt(args[1]) || 1
    if (isNaN(count) || count < 1) throw '⚠️ Jumlah warning harus berupa angka positif!'
    user.warning = (user.warning || 0) + count // Tambahkan warning

    // Mendapatkan nama grup dan nama pengirim
    let groupMetadata = m.isGroup ? await conn.groupMetadata(m.chat) : null
    let groupName = groupMetadata ? groupMetadata.subject : 'Grup Tidak Diketahui'
    let senderName = m.pushName || 'Admin'

    // Mendapatkan JID untuk mention
    let who = m.isGroup ? m.mentionedJid[0] || mention : mention

    // Cek jika warning sudah mencapai 5
    if (user.warning >= 5) {
        user.warning = 0 // Reset warning
        const bannedUser = {
            name: user.name || "Tidak Diketahui",
            id: mention.split('@')[0],
            date: new Date().toLocaleDateString('id-ID'),
            reason: `Mencapai batas 5/5 warning di grup ${groupName}`
        }
        ban.push(bannedUser) // Tambahkan pengguna ke daftar banned

        // Mengeluarkan user dari grup jika ada
        if (m.isGroup) {
            await conn.groupParticipantsUpdate(m.chat, [who], "remove").catch(err => {
                m.reply(`❌ Gagal mengeluarkan pengguna *@${who.split('@')[0]}*: ${err}`)
            })
        }

        // Kirim pesan ke grup (private notifications disabled)
        m.reply(`⚠️ Pengguna *@${who.split('@')[0]}* telah mendapatkan 5 warning dan kini telah *DIKELUARKAN DAN TERBANNED*! 🚷`, null, { mentions: [who] });
        // private notification disabled
    } else {
        // Kirim pesan ke grup dan user jika belum mencapai 5 warning
        m.reply(`✔️ Berhasil memberikan warning kepada *@${who.split('@')[0]}*! Sekarang pengguna memiliki *${user.warning}/5* warning. ⚠️\n🚨 Jika mencapai 5, kamu akan *DIKELUARKAN DAN TERBANNED*!`, null, { mentions: [who] })
        // private notification disabled 
    }
}

handler.help = ['warn @mention']
handler.tags = ['owner']
handler.command = /^warn(user)?$/i
handler.group = true
handler.admin = true

export default handler
