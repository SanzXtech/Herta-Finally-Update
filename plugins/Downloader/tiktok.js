import axios from 'axios'

let handler = async (m, { conn, args, text }) => {
  if (!text) {
    throw `❗ *Masukkan URL TikTok!*
    
*Example:* .tiktok https://vt.tiktok.com/ZSxxxxxxx/`
  }
  
  if (!/^https?:\/\/(www\.|vm\.|vt\.)?tiktok\.com\//.test(text)) {
    throw `❌ *Link tidak valid!*

*Example:* .tiktok https://vt.tiktok.com/ZSxxxxxxx/`
  }

  // Kirim pesan tunggu sebentar
  await m.reply('⏳ *Tunggu sebentar...*\n📱 Media TikTok sedang diproses')

  try {
    const res = await downloadTikTok(text)
    let caption = `🎵 *TikTok Downloader*
📌 *Judul:* ${res.title}
✅ *Status:* Berhasil diunduh`

    if (res.type === 'video') {
      await conn.sendMessage(m.chat, {
        video: { url: res.mp4Links[0].href },
        caption,
        mimetype: 'video/mp4'
      }, { quoted: m })

      if (res.mp3Link) {
        await conn.sendMessage(m.chat, {
          audio: { url: res.mp3Link.href },
          mimetype: 'audio/mp4',
          ptt: false
        }, { quoted: m })
      }

    } else if (res.type === 'image') {
      // Kirim semua gambar ke chat pemanggil (group atau private) — konsisten dengan fitur tiktokslide
      for (let i = 0; i < res.images.length; i++) {
        await conn.sendMessage(m.chat, {
          image: { url: res.images[i] },
          caption: i === 0 ? caption : ''
        }, { quoted: m })
      }

      if (res.mp3Link) {
        await conn.sendMessage(m.chat, {
          audio: { url: res.mp3Link.href },
          mimetype: 'audio/mp4',
          ptt: false
        }, { quoted: m })
      }

    } else {
      throw new Error('❌ Gagal mendeteksi tipe konten TikTok.')
    }
  } catch (error) {
    console.error('TikTok Download Error:', error)
    
    // Pesan error yang lebih user-friendly
    let errorMessage = '❌ *Gagal mengunduh TikTok*\n\n'
    
    if (error.message.includes('Token tidak ditemukan') || error.message.includes('Gagal mendapatkan token')) {
      errorMessage += '🔧 *Server downloader sedang bermasalah*\nCoba lagi dalam beberapa menit'
    } else if (error.message.includes('Timeout')) {
      errorMessage += '⏰ *Koneksi timeout*\nServer terlalu lama merespons, coba lagi'
    } else if (error.message.includes('Rate limit')) {
      errorMessage += '🚫 *Terlalu banyak permintaan*\nTunggu beberapa menit sebelum mencoba lagi'
    } else if (error.message.includes('private') || error.message.includes('tidak valid')) {
      errorMessage += `📱 *Video mungkin private atau link tidak valid*

*Example:* .tiktok https://vt.tiktok.com/ZSxxxxxxx/`
    } else {
      errorMessage += `🔍 *Detail error:* ${error.message}

*Coba dengan link yang berbeda atau hubungi admin*`
    }
    
    throw errorMessage
  }
}

handler.command = /^((tiktok|tt)(dl)?)$/i
handler.help = ['tiktok <url>']
handler.tags = ['downloader']
export default handler

// Scraper
async function getTokenAndCookie() {
  try {
    const res = await axios.get('https://tmate.cc/id', {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    })
    
    const cookie = res.headers['set-cookie']?.map(c => c.split(';')[0]).join('; ') || ''
    const tokenMatch = res.data.match(/<input[^>]+name="token"[^>]+value="([^"]+)"/i)
    const token = tokenMatch?.[1]
    
    if (!token) throw new Error('Token tidak ditemukan dari server')
    return { token, cookie }
  } catch (error) {
    throw new Error(`Gagal mendapatkan token: ${error.message}`)
  }
}

async function downloadTikTok(url) {
  try {
    const { token, cookie } = await getTokenAndCookie()
    const params = new URLSearchParams()
    params.append('url', url)
    params.append('token', token)

    const res = await axios.post('https://tmate.cc/action', params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://tmate.cc/id',
        'Origin': 'https://tmate.cc',
        'Cookie': cookie
      },
      timeout: 15000
    })

    const html = res.data?.data
    if (!html) throw new Error('Tidak ada data dari server, pastikan URL TikTok valid dan dapat diakses')

    const titleMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/i)
    const title = titleMatch?.[1]?.replace(/<[^>]+>/g, '').trim() || 'Tanpa Judul'

    // Improved regex pattern untuk menangkap link download
    const matches = [...html.matchAll(/<a[^>]+href="(https:\/\/[^"]+)"[^>]*>\s*<span>\s*<span>([^<]*)<\/span><\/span><\/a>/gi)]
    const seen = new Set()
    const links = matches
      .map(([_, href, label]) => ({ href, label: label.trim() }))
      .filter(({ href }) => {
        // Filter out unwanted links
        if (href.includes('play.google.com') || 
            href.includes('apps.apple.com') || 
            seen.has(href)) {
          return false
        }
        seen.add(href)
        return true
      })

    const mp4Link = links.find(v => /download without watermark|download video|mp4/i.test(v.label))
    const mp3Link = links.find(v => /download mp3 audio|audio|mp3/i.test(v.label))

    // Improved image detection
    const imageMatches = [...html.matchAll(/<img[^>]+src="(https:\/\/[^"]+tikcdn\.app[^"]+)"/gi)]
    const imageLinks = [...new Set(imageMatches.map(m => m[1]).filter(link => !link.includes('logo')))]

    if (mp4Link) {
      return {
        type: 'video',
        title,
        mp4Links: [mp4Link],
        mp3Link
      }
    }

    if (imageLinks.length > 0) {
      return {
        type: 'image',
        title,
        images: imageLinks,
        mp3Link
      }
    }

    throw new Error('Tidak dapat menemukan konten yang dapat diunduh. Mungkin video bersifat private atau URL tidak valid.')
    
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Timeout: Server terlalu lama merespons')
    } else if (error.response?.status === 429) {
      throw new Error('Rate limit exceeded: Terlalu banyak permintaan, coba lagi nanti')
    } else if (error.response?.status >= 500) {
      throw new Error('Server error: Layanan sementara tidak tersedia')
    } else {
      throw error
    }
  }
}