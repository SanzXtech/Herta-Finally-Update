import axios from 'axios'
import crypto from 'crypto'

let handler = async (m, { conn, text }) => {
  if (!text || !text.includes('youtube.com') && !text.includes('youtu.be'))
    return m.reply('Masukkan link YouTube yang valid!\nContoh: *.ytmp3 https://youtu.be/abc123xyz*')

  // Send processing message with emoji
  m.reply('Tunggu sebentar ya kak')

  const savetube = {
    api: {
      base: "https://media.savetube.me/api",
      cdn: "/random-cdn",
      info: "/v2/info",
      download: "/download"
    },
    headers: {
      'accept': '*/*',
      'content-type': 'application/json',
      'origin': 'https://yt.savetube.me',
      'referer': 'https://yt.savetube.me/',
      'user-agent': 'Postify/1.0.0'
    },
    crypto: {
      hexToBuffer: hexString => Buffer.from(hexString.match(/.{1,2}/g).join(''), 'hex'),
      decrypt: async (enc) => {
        const secretKey = 'C5D58EF67A7584E4A29F6C35BBC4EB12'
        const data = Buffer.from(enc, 'base64')
        const iv = data.slice(0, 16)
        const content = data.slice(16)
        const key = savetube.crypto.hexToBuffer(secretKey)
        const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv)
        let decrypted = decipher.update(content)
        decrypted = Buffer.concat([decrypted, decipher.final()])
        return JSON.parse(decrypted.toString())
      }
    },
    youtube: url => {
      const regex = [
        /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
        /youtu\.be\/([a-zA-Z0-9_-]{11})/
      ]
      for (let r of regex) {
        if (r.test(url)) return url.match(r)[1]
      }
      return null
    },
    request: async (endpoint, data = {}, method = 'post') => {
      const { data: response } = await axios({
        method,
        url: `${endpoint.startsWith('http') ? '' : savetube.api.base}${endpoint}`,
        data: method === 'post' ? data : undefined,
        params: method === 'get' ? data : undefined,
        headers: savetube.headers
      })
      return { status: true, code: 200, data: response }
    },
    getCDN: async () => {
      const response = await savetube.request(savetube.api.cdn, {}, 'get')
      return { status: true, code: 200, data: response.data.cdn }
    },
    download: async (link, format) => {
      const id = savetube.youtube(link)
      if (!id) throw new Error('Link YouTube tidak valid!')
      const cdn = (await savetube.getCDN()).data
      const info = await savetube.request(`https://${cdn}${savetube.api.info}`, { url: `https://www.youtube.com/watch?v=${id}` })
      const decrypted = await savetube.crypto.decrypt(info.data.data)
      const dl = await savetube.request(`https://${cdn}${savetube.api.download}`, {
        id,
        downloadType: 'audio',
        quality: '128',
        key: decrypted.key
      })
      return {
        title: decrypted.title || 'Tanpa Judul',
        thumbnail: decrypted.thumbnail || `https://i.ytimg.com/vi/${id}/0.jpg`,
        url: dl.data.data.downloadUrl
      }
    }
  }

  try {
    const result = await savetube.download(text, 'mp3')
    await conn.sendMessage(m.chat, {
      audio: { url: result.url },
      mimetype: 'audio/mp4',
      fileName: result.title + '.mp3'
    }, { quoted: m })
  } catch (e) {
    console.error(e)
    m.reply('❌ Gagal mengunduh audio. Pastikan link valid dan coba lagi.')
  }
}

handler.command = ['ytmp3']
handler.help = ['ytmp3 <link youtube>']
handler.tags = ['downloader']

export default handler
