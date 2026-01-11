import axios from "axios";

let handler = async (m, {
    conn,
    usedPrefix,
    command,
    text
}) => {
    if (!text) throw `Contoh: ${
 usedPrefix + command
 } halo, apa kabar`;

    try {
        let res = await deepseek(text);
        
        conn.reply(m.chat, res, m);
    } catch (e) {
     console.log(e)
     conn.reply(m.chat, 'lagi error bang fitur nya :)');
    }
};

handler.help = ["deepseek"];
handler.tags = ["ai"];
handler.command = /^(deepseek)$/i;
handler.limit = true;

export default handler;

async function deepseek(query) {
        let { data } = await axios.post("https://api.blackbox.ai/api/chat", {
            messages: [{ id: null, role: "user", content: query }],
            userSelectedModel: "deepseek-ri"
        })
        return data
}