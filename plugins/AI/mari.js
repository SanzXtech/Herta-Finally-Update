import axios from "axios";

async function aiii(teks) {
    const headers = {
        'Content-Type': 'application/json',
        'Origin': 'https://www.blackbox.ai',
        'Cookie': 'sessionId=39ff7566-c561-4bb6-a117-a418f6566090'
    };

    const data = {
        messages: [{
            id: "Q6FLZMvPc9hIzAE16wBFl",
            content: teks,
            role: "user"
        }],
        id: "Q6FLZMvPc9hIzAE16wBFl",
        previewToken: null,
        userId: null,
        codeModelMode: true,
        agentMode: {
            mode: true,
            id: "mari",
            name: "Iochi Mari"
        },
        trendingAgentMode: {},
        isMicMode: false,
        maxTokens: 1024,
        playgroundTopP: null,
        playgroundTemperature: null,
        isChromeExt: false,
        githubToken: "",
        clickedAnswer2: false,
        clickedAnswer3: false,
        clickedForceWebSearch: false,
        visitFromDelta: false,
        mobileClient: false,
        userSelectedModel: null,
        validated: "00f37b34-a166-4efb-bce5-1312d87f2f94",
        imageGenerationMode: false,
        webSearchModePrompt: false
    };

    try {
        const response = await axios.post('https://www.blackbox.ai/api/chat', data, { headers });
        return response.data;
    } catch (error) {
        console.error('Error:', error.message);
        return 'Terjadi kesalahan saat memproses permintaan.';
    }
}

const handler = async (m, { conn, args, text, usedPrefix, command }) => {
    const q = m.quoted && m.quoted.text ? m.quoted.text : text;

    if (!q) {
        return m.reply(`I-iyaa, Ada apa ya kak?`);
    }

    const result = await aiii(q);
    await m.reply(result || 'Maaf kak, aku lagi cape banget, nanti lagi ya ngobrolnya🤗');
};

handler.command = ['mari'];
handler.help = ['mari'];
handler.tags = ['ai'];

export default handler;
