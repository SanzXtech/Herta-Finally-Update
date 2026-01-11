import axios from 'axios';

async function fetchBlackboxAI(prompt, callback) {
    const url = 'https://www.blackbox.ai/api/chat';
    const headers = {
        'authority': 'www.blackbox.ai',
        'accept': '*/*',
        'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
        'content-type': 'application/json',
        'origin': 'https://www.blackbox.ai',
        'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36'
    };

    const data = {
        "messages": [{ "role": "user", "content": prompt, "id": "54lcaEJ" }],
        "agentMode": {},
        "id": "RDyqb0u",
        "maxTokens": 1024,
        "webSearchModePrompt": true
    };

    try {
        const response = await axios({
            method: 'post',
            url: url,
            headers: headers,
            data: data,
            responseType: 'stream'
        });

        let output = '';
        let search = [];
        
        response.data.on('data', chunk => {
            const chunkStr = chunk.toString();
            output += chunkStr;
            
            const match = output.match(/\$~~~\$(.*?)\$~~~\$/);
            if (match) {
                search = JSON.parse(match[1]);
                const text = output.replace(match[0], '');
                output = text.split('\n\n\n\n')[1];
                callback({ search });
                callback({ text: output });
            } else {
                if (search.length) callback({ text: chunkStr });
            }
        });
        
        return new Promise((resolve) => {
            response.data.on('end', () => {
                resolve({ search, text: output.replace('**', '*').trim() });
            });
        });
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

let handler = async (m, { conn, text }) => {
    if (!text) return conn.sendMessage(m.chat, { text: 'Apa yang kamu ingin tanyakan?' }, { quoted: m });

    let mess = await conn.sendMessage(m.chat, { text: 'Memproses pertanyaan...' }, { quoted: m });

    try {
        let teks = '';
        await fetchBlackboxAI(text, _ => {
            if (_.text) {
                teks += _.text;
                conn.sendMessage(m.chat, { text: teks, edit: mess.key });
            } else if (_.search) {
                console.log('Search result:', _.search);
            }
        });
    } catch (error) {
        conn.sendMessage(m.chat, { text: 'Terjadi kesalahan saat memproses permintaan Anda.' }, { quoted: m });
    }
};

handler.command = /^blackbox$/i;
handler.help = ['blackbox <pertanyaan>'];
handler.tags = ['ai'];

export default handler;
