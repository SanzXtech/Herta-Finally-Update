import axios from 'axios'

async function saveweb2zip(url, options = {}) {
    if (!url) throw new Error('Url is required');
    url = url.startsWith('https://') ? url : `https://${url}`;
    const {
        renameAssets = false,
        saveStructure = false,
        alternativeAlgorithm = false,
        mobileVersion = false
    } = options;
    
    let { data } = await axios.post('https://copier.saveweb2zip.com/api/copySite', {
        url,
        renameAssets,
        saveStructure,
        alternativeAlgorithm,
        mobileVersion
    }, {
        headers: {
            accept: '*/*',
            'content-type': 'application/json',
            origin: 'https://saveweb2zip.com',
            referer: 'https://saveweb2zip.com/',
            'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
        }
    });
    
    while (true) {
        let { data: process } = await axios.get(`https://copier.saveweb2zip.com/api/getStatus/${data.md5}`, {
            headers: {
                accept: '*/*',
                'content-type': 'application/json',
                origin: 'https://saveweb2zip.com',
                referer: 'https://saveweb2zip.com/',
                'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
            }
        });
        
        if (!process.isFinished) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
        } else {
            return {
                url,
                error: {
                    text: process.errorText,
                    code: process.errorCode,
                },
                copiedFilesAmount: process.copiedFilesAmount,
                downloadUrl: `https://copier.saveweb2zip.com/api/downloadArchive/${process.md5}`
            }
        }
    }
}

let handler = async (m, { conn, args }) => {
    try {
        if (!args[0]) return m.reply('Mana Web Yang Mau Di Save\n\nExample : .saveweb https://kimkiro.my.id');
        
        m.reply('Wait...');
        
        let result = await saveweb2zip(args[0], { renameAssets: true });        
        
        await conn.sendMessage(m.chat, { 
            document: { url: result.downloadUrl }, 
            fileName: `${args[0]}.zip`,
            mimetype: 'application/zip',
        }, { quoted: m });
        
    } catch (e) {
        m.reply(e.message);
    }
}

handler.help = ['saveweb'];
handler.command = ['saveweb', 'web2zip'];
handler.tags = ['tools'];

export default handler;