import fetch from 'node-fetch'

let handler = async (m, {
    conn,
    text,
    usedPrefix,
    command
}) => {
    if (!text) throw `Example: ${usedPrefix + command} https://vt.tiktok.com/ZS81qJD5v/`
    if (!(text.includes('http://') || text.includes('https://'))) return m.reply(`url invalid, please input a valid url. Try with add http:// or https://`)
    if (!text.includes('tiktok.com')) return m.reply(`Invalid Tiktok URL.`)
    try {
        let res = await fetch(`https://api.lolhuman.xyz/api/tiktokslide?apikey=${process.env.LOLHUMAN}&url=${text}`)
        let anu = await res.json()
        if (anu.status != '200') throw Error(anu.message)
        anu = anu.result
        if (anu.length == 0) throw Error('Error : no data')
        for (let i = 0; i < anu.length; i++) {
            const x = anu[i]
            const caption = i === 0 ? `Mengirim 1 dari ${anu.length} slide gambar.` : undefined
            // Kirim semua slide ke chat tempat perintah dipanggil (group atau private)
            await conn.sendMessage(m.chat, {
                image: { url: x },
                ...(caption ? { caption } : {})
            }, { quoted: m })
        }
    } catch (e) {
        console.log(e)
        throw `invalid slideshow url / media isn't available.`
    }
}

handler.menu = ['tiktokslide <url>']
handler.tags = ['search']
handler.command = /^((tt|tiktok)slide)$/i

handler.premium = true
handler.limit = true

export default handler