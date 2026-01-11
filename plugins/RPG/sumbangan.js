if (!conn.sumbangan) conn.sumbangan = {}

async function handler(m, { conn, args }) {
    if (Object.keys(conn.sumbangan).length > 0) {
        return m.reply('⚠️ Saat ini sedang berlangsung sesi sumbangan di grup ini.')
    }

    if (conn.sumbangan[m.sender]) return m.reply('Kamu sedang meminta sumbangan!')
    const count = parseInt(args[0])
    if (!count) return m.reply("⚠️ Masukkan angka jumlah sumbangan.")
    if (isNaN(count)) return m.reply("⚠️ Jumlah sumbangan harus berupa angka.")
    
    let txt = `Apakah kamu yakin ingin memberi sumbangan\n✅ (Yes) ❌ (No)`
    let confirm = `😔 Kak bagi sumbangan\ncuma *${count}* dong.\n\n${txt}`
    let { key } = await conn.reply(m.chat, confirm, m, {
        mentions: [m.sender]
    })
    conn.sumbangan[m.sender] = {
        sender: m.sender,
        message: m,
        count,
        key,
        chat: m.chat,
        pesan: conn,
        timeout: setTimeout(() => {
            conn.sendMessage(m.chat, { delete: key })
            delete conn.sumbangan[m.sender]
        }, 60 * 1000)
    }
}

handler.before = async m => {
    if (m.isBaileys || !m.text) return

    for (let sender in conn.sumbangan) {
        let { timeout, message, count, key, chat, pesan } = conn.sumbangan[sender]

        if (m.chat !== chat) continue

        if (/^yes$/i.test(m.text)) {
            if (m.sender !== sender) {
                let user = global.db.data.users[m.sender]
                let _user = global.db.data.users[sender]
                
                if (user.money >= count) {
                    user.money -= count
                    _user.money += count
                    m.reply(`✨ Terima kasih!\n${m.name.split('\n')[0]} telah memberi sumbangan sebesar *${count}*`)
                    pesan.sendMessage(m.chat, { delete: key })
                    clearTimeout(timeout)
                    delete conn.sumbangan[sender]
                } else {
                    m.reply("⚠️ Saldo kamu tidak cukup untuk memberi sumbangan sebesar *" + count + "*.")
                    pesan.sendMessage(m.chat, { delete: key })
                    clearTimeout(timeout)
                    delete conn.sumbangan[sender]
                }
            } else {
                await m.reply("⚠️ Tidak bisa meminta sumbangan ke diri anda sendiri!.")
            }
        }
        
        if (/^no$/i.test(m.text)) {
            m.reply(`😔 ${m.name.split('\n')[0]} kamu berdosa banget kak...`)
            pesan.sendMessage(m.chat, { delete: key })
            clearTimeout(timeout)
            delete conn.sumbangan[sender]
        }
    }
}

handler.help = ['sumbangan'].map(v => v + ' [jumlah]')
handler.tags = ['rpg']
handler.command = /^(sumbangan)$/i
handler.disabled = false

export default handler
