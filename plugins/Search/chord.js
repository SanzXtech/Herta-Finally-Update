import axios from 'axios'
import cheerio from 'cheerio'

let handler = async (m, { text }) => {
    if (!text) throw 'Mana judul lagunya?'
    let sanz = await chord(text)
    if (!sanz) return m.reply('Maaf, lagu tidak ditemukan.')
    m.reply(`*Song :* ${sanz.title}\n*Chord :*\n\n${sanz.chord}`)
}

handler.help = ['chord']
handler.tags = ['tools']
handler.command = /^(chord|kuncigitar)$/i
handler.limit = true

export default handler

async function chord(query) {
    return new Promise(async (resolve, reject) => {
        const head = {
            "User-Agent": "Mozilla/5.0 (Linux; Android 9; CPH1923) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.62 Mobile Safari/537.36",
            "Cookie": "__gads=ID=4513c7600f23e1b2-22b06ccbebcc00d1:T=1635371139:RT=1635371139:S=ALNI_MYShBeii6AFkeysWDKiD3RyJ1106Q; _ga=GA1.2.409783375.1635371138; _gid=GA1.2.1157186793.1635371140; _fbp=fb.1.1635371147163.1785445876"
        };

        let { data } = await axios.get("http://app.chordindonesia.com/?json=get_search_results&exclude=date,modified,attachments,comment_count,comment_status,thumbnail,thumbnail_images,author,excerpt,content,categories,tags,comments,custom_fields&search=" + query, { headers: head });

        // Check if the song is found
        if (!data.posts || data.posts.length === 0) {
            return resolve(null); // If no posts are found, return null
        }

        axios.get("http://app.chordindonesia.com/?json=get_post&id=" + data.posts[0].id, {
            headers: head
        }).then(anu => {
            let $ = cheerio.load(anu.data.post.content);
            resolve({
                title: data.posts[0].title_plain,
                chord: $("pre").text().trim()
            });
        }).catch(reject);
    });
}
