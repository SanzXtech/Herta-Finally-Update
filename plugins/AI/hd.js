import fetch from 'node-fetch'
import FormData from 'form-data'

async function upscaleImageBuffer(imageBuffer, mime = 'image/jpeg') {
  const ext = (mime.split('/')[1]) || 'jpg'
  const filename = `upscaled_${Date.now()}.${ext}`

  const form = new FormData()
  form.append('image', imageBuffer, { filename, contentType: mime })
  form.append('scale', '2')

  const headers = {
    ...form.getHeaders(),
    accept: 'application/json',
    'x-client-version': 'web',
    'x-locale': 'en'
  }

  const res = await fetch('https://api2.pixelcut.app/image/upscale/v1', {
    method: 'POST',
    headers,
    body: form
  })

  const json = await res.json()

  if (!json?.result_url || !json.result_url.startsWith('http')) {
    throw new Error('Gagal mendapatkan URL hasil dari Pixelcut.')
  }

  const resultBuffer = await (await fetch(json.result_url)).buffer()
  return resultBuffer
}

let handler = async (m, { conn, usedPrefix, command }) => {
  switch (command) {
    case 'hdr':
    case 'hd': {
      const user = global.db.data.users[m.sender]
      const isPremium = user?.premium

      // Inisialisasi queue jika belum ada
      if (!conn.hdQueue) conn.hdQueue = []
      if (!conn.hdProcessing) conn.hdProcessing = false

      const q = m.quoted ? m.quoted : m
      const mime = q.mimetype || q.msg?.mimetype || ''

      if (!/image\/(jpe?g|png)/i.test(mime)) {
        await conn.sendMessage(m.chat, { react: { text: '❗', key: m.key } })
        return m.reply(`Kirim atau *balas gambar* dengan perintah:\n*${usedPrefix + command}*`)
      }

      const processHD = async (messageObj, imageBuffer, mimeType) => {
        try {
          const resultBuffer = await upscaleImageBuffer(imageBuffer, mimeType)

          await conn.sendMessage(messageObj.chat, {
            image: resultBuffer,
            caption: `✨ Gambar kamu telah ditingkatkan hingga 2x resolusi.\n\n📈 Kualitas lebih tajam & detail lebih jelas.\n\n🔧 _Gunakan fitur ini kapan saja untuk memperjelas gambar blur._`.trim()
          }, { quoted: messageObj })

          await conn.sendMessage(messageObj.chat, { react: { text: '✅', key: messageObj.key } })
        } catch (err) {
          console.error('[❌] Gagal proses HD:', err)
          await conn.sendMessage(messageObj.chat, { react: { text: '❌', key: messageObj.key } })
          await conn.sendMessage(messageObj.chat, {
            text: `❌ Upscaling gagal:\n${err.message || err}`
          }, { quoted: messageObj })
        }
      }

      // Jika premium, langsung proses
      if (isPremium) {
        await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })
        await m.reply('[⏳] ᴘʀᴏsᴇs ᴋᴀᴋ...')
        const img = await q.download()
        return await processHD(m, img, mime)
      }

      // Cek apakah user sudah ada di antrian
      const alreadyInQueue = conn.hdQueue.find(entry => entry.sender === m.sender)
      if (alreadyInQueue) {
        const pos = conn.hdQueue.findIndex(entry => entry.sender === m.sender) + 1
        return m.reply(`[⏳] ᴋᴀᴍᴜ sᴜᴅᴀʜ ᴀᴅᴀ ᴅɪ ᴀɴᴛʀɪᴀɴ ᴋᴇ *${pos}*, sɪʟᴀʜᴋᴀɴ ᴛᴜɴɢɢᴜ ʜɪɴɢɢᴀ ᴘʀᴏsᴇs ᴋᴀᴍᴜ`)
      }

      // Cek batas maksimal antrian
      if (conn.hdQueue.length >= 10) {
        return m.reply('[❌] ᴀɴᴛʀɪᴀɴ ᴘᴇɴᴜʜ ᴋᴀᴋ, ᴍᴀᴋsɪᴍᴀʟ ʜᴀɴʏᴀ *10 ᴘᴇɴɢɢᴜɴᴀ*. ᴄᴏʙᴀ ʟᴀɢɪ ɴᴀɴᴛɪ')
      }

      // Download gambar sebelum masuk antrian
      const imgBuffer = await q.download()

      // Tambahkan ke antrian
      conn.hdQueue.push({
        m: m,
        sender: m.sender,
        imageBuffer: imgBuffer,
        mime: mime,
        chat: m.chat,
        key: m.key
      })

      const pos = conn.hdQueue.length
      await m.reply(`[⏳] ᴋᴀᴍᴜ ʙᴇʀᴀᴅᴀ ᴅɪ ᴀɴᴛʀɪᴀɴ ᴋᴇ *#${pos}* sɪʟᴀʜᴋᴀɴ ᴛᴜɴɢɢᴜ ʜɪɴɢɢᴀ ᴘʀᴏsᴇs ᴋᴀᴍᴜ`)

      // Mulai proses antrian jika belum berjalan
      if (!conn.hdProcessing) {
        conn.hdProcessing = true
        processHDQueue(conn, processHD)
      }

      break
    }
  }
}

async function processHDQueue(conn, processHD) {
  while (conn.hdQueue.length > 0) {
    const queueItem = conn.hdQueue[0]
    const { m, imageBuffer, mime, chat, key, sender } = queueItem

    try {
      await conn.sendMessage(chat, { react: { text: '⏳', key: key } })
      await conn.sendMessage(chat, { text: '[⏳] ᴘʀᴏsᴇs ᴋᴀᴋ...' }, { quoted: m })

      const messageObj = {
        chat: chat,
        key: key,
        quoted: m
      }

      await processHD(messageObj, imageBuffer, mime)

      // Delay kecil sebelum proses berikutnya
      await new Promise(res => setTimeout(res, 2000))
    } catch (e) {
      console.error('❌ Gagal proses antrian HD:', e)
      await conn.sendMessage(chat, { react: { text: '❌', key: key } })
      await conn.sendMessage(chat, { text: '[❌] ᴛᴇʀᴊᴀᴅɪ ᴋᴇsᴀʟᴀʜᴀɴ sᴀᴀᴛ ᴍᴇᴍᴘʀᴏsᴇs ɢᴀᴍʙᴀʀ ᴋᴀᴍᴜ' }, { quoted: m })
    }

    // Hapus item pertama dari antrian
    conn.hdQueue.shift()
  }

  conn.hdProcessing = false
}

handler.help = ['upscale', 'hdr']
handler.tags = ['tools', 'ai']
handler.command = /^upscale$|^hd$|^hdr$/i

export default handler
