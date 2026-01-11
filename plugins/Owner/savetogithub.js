import { Octokit } from '@octokit/rest'
import path from 'path'
import { Buffer } from 'buffer'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const githubToken = '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' // GANTI TOKEN!
  const username = 'SanzXtech'
  const repo = 'HertaV3'

  if (!text) throw `Contoh:\n${usedPrefix}${command} plugins/tes.txt\nBalas teks/file yang ingin diupload.`

  const filePath = text.trim()
  const octokit = new Octokit({ auth: githubToken })
  let contentBuffer = null

  // Ambil isi dari reply atau media
  if (m.quoted) {
    if (m.quoted.fileSha256 || m.quoted.mimetype) {
      contentBuffer = await m.quoted.download()
    } else if (m.quoted.text) {
      contentBuffer = Buffer.from(m.quoted.text)
    }
  } else if (m.mimetype) {
    contentBuffer = await m.download()
  }

  if (!contentBuffer) {
    const lines = text.split('\n')
    if (lines.length < 2) throw '❌ Tidak ada isi yang ingin diupload.'
    contentBuffer = Buffer.from(lines.slice(1).join('\n').trim())
  }

  // 🔍 Cek apakah file sudah ada
  let sha = null
  try {
    const { data } = await octokit.repos.getContent({
      owner: username,
      repo: repo,
      path: filePath,
    })
    sha = data?.sha || null
  } catch (err) {
    // jika file belum ada, biarkan sha null (berarti akan create file)
    if (err.status !== 404) {
      console.error(err)
      return m.reply(`❌ Gagal cek file: ${err.message}`)
    }
  }

  // Upload (create/update)
  try {
    await octokit.repos.createOrUpdateFileContents({
      owner: username,
      repo: repo,
      path: filePath,
      message: `Upload ${filePath} via bot`,
      content: contentBuffer.toString('base64'),
      sha: sha || undefined,
      committer: {
        name: 'SanzBot',
        email: 'bot@sanz.dev'
      },
      author: {
        name: 'SanzBot',
        email: 'bot@sanz.dev'
      }
    })

    m.reply(`
✅ *Berhasil upload ke GitHub!*
📁 File: \`${filePath}\`
🔗 Link: https://github.com/${username}/${repo}/blob/master/${filePath}
    `.trim())
  } catch (e) {
    console.error(e)
    m.reply(`❌ Gagal upload ke GitHub:\n${e.message}`)
  }
}

handler.help = ['savetogithub <path/file>']
handler.tags = ['owner']
handler.command = /^savetogithub$/i
handler.owner = true

export default handler