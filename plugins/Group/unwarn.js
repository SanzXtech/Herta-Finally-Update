let handler = async (m, { conn, args }) => {
    if (!args || !args[0]) throw 'Siapa yang mau di-Unwarn?'

    // Validasi database
    const db = global.db;
    if (!db || !db.data || !db.data.users) throw '⚠️ Database tidak tersedia atau tidak valid!'

    // Cek mention atau nomor
    let mention = m.mentionedJid[0] || conn.parseMention(args[0]) || args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net'
    if (!mention || !mention.includes('@s.whatsapp.net')) throw '⚠️ Tag user atau masukkan nomor dengan benar!'

    // Pastikan user ada dalam database
    if (!(mention in db.data.users)) throw '❌ User tidak terdaftar dalam DATABASE!!'

    let user = db.data.users[mention]

    // Reset warning user ke 0
    if (!user.warning || user.warning === 0) throw `✔️ User sudah tidak memiliki warning!`
    user.warning = 0

    // Kirim notifikasi ke grup dan user
    m.reply(`✔️ Berhasil menghapus semua warning untuk *@${mention.split('@')[0]}*! 🚨`, null, { mentions: [mention] })
    await conn.sendMessage(mention, { 
        text: `⚠️ Warning kamu telah di *reset* oleh Admin.\nSekarang kamu tidak memiliki *warning*. 🚀`,
    }, { quoted: m })
}

handler.help = ['unwarn @mention']
handler.tags = ['owner']
handler.command = /^unwarn(user)?$/i
handler.group = true
handler.admin = true // Hanya admin grup yang bisa menggunakan fitur ini

export default handler
