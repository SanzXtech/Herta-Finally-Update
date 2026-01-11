let handler = async (m, { conn }) => {
    const fkontak = {
        key: {
            participants: '0@s.whatsapp.net',
            remoteJid: 'status@broadcast',
            fromMe: false,
            id: 'Halo'
        },
        message: {
            contactMessage: {
                displayName: 'Anonymous Chat',
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;Anonymous;;;\nFN:Anonymous\nitem1.TEL;waid=0:0\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
            }
        },
        participant: '0@s.whatsapp.net'
    }

    let foto = 'https://files.catbox.moe/zn9aza.jpg'
    let teks = `📖 *TUTORIAL ANONYMOUS CHAT*

Fitur anonymous chat memungkinkan kamu untuk ngobrol dengan orang lain secara *rahasia tanpa saling mengenal identitas*.

🔹 *Cara Menggunakan:*
1. Ketik *.start* untuk mencari partner chat.
2. Ketik *.leave* untuk keluar dari chat.
3. Ketik *.next* untuk ganti partner.
4. Ketik *.sendkontak* untuk mengirim nomor ke partner (jika ingin dikenal).
   
💡 *Tips:*
- Jangan spam!
- Jaga etika dalam percakapan.
- Gunakan fitur dengan bijak 😊

🎯 Selamat mencoba!`

    await conn.sendFile(m.chat, foto, 'anonymous.jpg', teks, fkontak)
}

handler.help = ['anonymous']
handler.tags = ['main']
handler.command = /^(anonymous)$/i
handler.group = true

export default handler