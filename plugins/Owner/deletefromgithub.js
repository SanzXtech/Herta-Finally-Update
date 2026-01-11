import { Octokit } from '@octokit/rest'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const githubToken = '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' // GANTI token kamu
  const username = 'SanzXtech'
  const repo = 'HertaV3'

  if (!text) throw `Contoh:\n${usedPrefix}${command} plugins/contoh.js`

  const filePath = text.trim()
  const octokit = new Octokit({ auth: githubToken })

  try {
    // Cek apakah file ada
    const { data } = await octokit.repos.getContent({
      owner: username,
      repo: repo,
      path: filePath,
    })

    const sha = data?.sha
    if (!sha) throw 'SHA file tidak ditemukan.'

    // Hapus file
    await octokit.repos.deleteFile({
      owner: username,
      repo: repo,
      path: filePath,
      message: `Delete ${filePath} via bot`,
      sha: sha,
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
🗑️ *Berhasil menghapus file dari GitHub!*
📁 File: \`${filePath}\`
`.trim())
  } catch (e) {
    console.error(e)
    if (e.status === 404) {
      m.reply(`❌ File tidak ditemukan: \`${filePath}\``)
    } else {
      m.reply(`❌ Gagal hapus file dari GitHub:\n${e.message}`)
    }
  }
}

handler.help = ['deletefromgithub <path/file>']
handler.tags = ['owner']
handler.command = /^deletefromgithub$/i
handler.owner = true

export default handler