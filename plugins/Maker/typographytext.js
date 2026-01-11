import { ephoto } from "../../lib/ephoto.js"

let handler = async (m, {
    conn,
    usedPrefix,
    command,
    text
}) => {
    if (!text)
        throw `Contoh: ${
 usedPrefix + command
 } SanzOnly`;
 
    try {

        let wk = await ephoto("https://en.ephoto360.com/create-typography-text-effect-on-pavement-online-774.html", text);
        await conn.sendMessage(m.chat, { image: { url: wk }, caption: "*udah jadi nih kak*" },{quoted:m});
    } catch (e) {
        throw e
    }
};

handler.help = handler.command = ["typographytext"];
handler.tags = ["maker"];
handler.limit = true;

export default handler;
