import fetch from 'node-fetch';

let handler = async (m, { conn, text }) => {
    if (!text) return m.reply("Mana teksnya?");

    try {
        let buffer = await CarbonifyV1(text);
        conn.sendMessage(m.chat, { image: buffer }, { quoted: m });
    } catch (error) {
        console.error(error);
        m.reply("Terjadi kesalahan saat memproses permintaan.");
    }
};

handler.help = ["carbon"];
handler.tags = ["maker"];
handler.command = /^(carbon(ify)?)$/i;

export default handler;

async function CarbonifyV1(input) {
    let response = await fetch("https://carbonara.solopov.dev/api/cook", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "code": input
        })
    });

    if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    let blob = await response.blob();
    let arrayBuffer = await blob.arrayBuffer();
    let buffer = Buffer.from(arrayBuffer);
    return buffer;
              }
