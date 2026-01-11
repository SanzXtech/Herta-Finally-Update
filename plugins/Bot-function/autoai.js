import axios from "axios";

async function aiii(teks) {
    const headers = {
        'Content-Type': 'application/json',
        'Origin': 'https://www.blackbox.ai',
        'Cookie': 'sessionId=39ff7566-c561-4bb6-a117-a418f6566090'
    };

    const data = {
        "messages": [
            {
                "id": "KlNJ4hiPpDLmo4IjnrScC",
                "content": teks,
                "role": "user"
            }
        ],
        "id": "KlNJ4hiPpDLmo4IjnrScC",
        "previewToken": null,
        "userId": null,
        "codeModelMode": true,
        "agentMode": {
            "mode": true,
            "id": "hoshino",
            "name": "Takanashi Hoshino"
        },
        "trendingAgentMode": {},
        "isMicMode": false,
        "maxTokens": 1024,
        "playgroundTopP": null,
        "playgroundTemperature": null,
        "isChromeExt": false,
        "githubToken": "",
        "clickedAnswer2": false,
        "clickedAnswer3": false,
        "clickedForceWebSearch": false,
        "visitFromDelta": false,
        "mobileClient": false,
        "userSelectedModel": null,
        "validated": "00f37b34-a166-4efb-bce5-1312d87f2f94",
        "imageGenerationMode": false,
        "webSearchModePrompt": false
    };

    try {
        const response = await axios.post('https://www.blackbox.ai/api/chat', data, { headers });
        return response.data;
    } catch (error) {
        console.error('Error:', error.message);
        return 'Terjadi kesalahan saat memproses permintaan.';
    }
}

let handler = (m) => m;
handler.before = async function (m, { conn, command, q, prefix, isAccept }) {
    const chat = global.db.data.chats[m.chat];
    const numberQuery = q.replace(new RegExp("[()+-/ +/]", "gi"), "") + `@s.whatsapp.net`;
    const Input = m.isGroup
        ? m.mentionByTag[0]
            ? m.mentionByTag[0]
            : m.mentionByReply
            ? m.mentionByReply
            : q
            ? numberQuery
            : false
        : false;
    const isSticker = m.type == "stickerMessage";
    const isCmd = m.body.startsWith(prefix);
    const allcommand = db.data.allcommand;
    const replyCommand = isCmd ? isCmd : allcommand.includes(toFirstCase(command));
    const isAudio = m.type == "audioMessage";

    const isReplySticker =
        m.type === "stickerMessage" && m.content.includes("stickerMessage");
    const isQuotedReplySticker =
        m.type === "stickerMessage" && m.content.includes("extendedTextMessage");
    const mentionByReplySticker =
        m.type == "stickerMessage" && m.message.stickerMessage.contextInfo != null
            ? m.message.stickerMessage.contextInfo.participant || ""
            : "";

    if (
        (m.isGroup &&
            chat.simi &&
            Input == m.botNumber &&
            !replyCommand &&
            !isAudio &&
            !isAccept &&
            !allcommand.includes(toFirstCase(command))) ||
        (m.isGroup &&
            chat.simi &&
            m.mentionByReplySticker == m.botNumber &&
            isSticker &&
            !replyCommand) ||
        (m.isGroup &&
            chat.simi &&
            (m.body.toLowerCase().includes(botName.toLowerCase()) ||
                m.body.toLowerCase().includes(botName.toLowerCase().substring(0, 3)))) ||
        (!m.isGroup &&
            (m.body.toLowerCase().includes(botName.toLowerCase()) ||
                m.body.toLowerCase().includes(botName.toLowerCase().substring(0, 3))))
    ) {
        // Check jika ada game aktif
        for (let key in conn.game) {
            if (key.includes(m.chat)) return;
        }

        await sleep(2000);
        conn.sendPresenceUpdate("composing", m.chat);

        // Tutup grup
        if (m.body.includes('group') && m.body.includes('tutup') || m.body.includes('grup') && m.body.includes('tutup')) {
            if (!m.isBotAdmin && !isOwner) throw `Maaf, Aku bukan admin group ini. 😔`;
            if (!m.isAdmin && !isOwner) throw `Maaf, hanya admin yang bisa menggunakan perintah ini. 😔`;

            await conn.groupSettingUpdate(m.chat, "announcement");
            return m.reply(`Oke, grup telah ditutup. Semoga lebih teratur ya~ 😉`);
        }

        // Buka grup
        if (m.body.includes('group') && m.body.includes('buka') || m.body.includes('grup') && m.body.includes('buka')) {
            if (!m.isBotAdmin && !isOwner) throw `Maaf, Aku bukan admin group ini. 😔`;
            if (!m.isAdmin && !isOwner) throw `Maaf, hanya admin yang bisa menggunakan perintah ini. 😔`;

            await conn.groupSettingUpdate(m.chat, "not_announcement");
            return m.reply(`Oke, grup telah dibuka. Ayo kita beraktivitas bersama-sama! 🤗`);
        }

        if (isQuotedReplySticker || isReplySticker) {
            await sleep(2000);
            if (db.data.stickerBot == {}) return;
            let namastc = Object.keys(db.data.stickerBot).getRandom();
            if (db.data.stickerBot[namastc]) conn.sendMessage(m.chat, { sticker: { url: db.data.stickerBot[namastc].link } }, { quoted: m });
        } else {
            const query = m.body;
            if (!query) return m.reply('Ada apa kak?');

            try {
                await sleep(1000);
                const result = await aiii(query);
                m.reply(result || 'Maaf kak, aku lagi cape banget, nanti ngobrol lagi ya 🤗');
            } catch (e) {
                console.error(e);
                m.reply('Sepertinya ada kendala. Coba lagi nanti ya.');
            }
        }
    }
};

export default handler;