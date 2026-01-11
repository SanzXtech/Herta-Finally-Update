import axios from "axios";

let handler = async (m, { conn, text }) => {
  // Cek apakah perintah digunakan di grup
  if (!m.isGroup) {
    throw "Maaf kak, fitur auto AI ini hanya bisa diaktifkan di grup.";
  }

  // Validasi database chats
  if (!global.db.data.chats) global.db.data.chats = {};
  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = { simi: false };

  const chat = global.db.data.chats[m.chat];

  // Mengatur status auto-respon
  if (text === "off") {
    chat.simi = false;
    return m.reply("Berhasil mematikan auto ai di grup ini.");
  } else if (text === "on") {
    chat.simi = true;
    return m.reply("Berhasil mengaktifkan auto ai di grup ini.");
  }

  // Jika tidak ada teks yang diberikan
  if (!text) throw "Mau ngomong apa kak sama Hoshino?";

  try {
    let response = await getMessage(text);
    m.reply(response || "Maaf kak, aku lagi cape banget. Coba lagi nanti ya~ 🤗");
  } catch (e) {
    console.error(e);
    m.reply("Maaf kak, aku tidak bisa memahami pesanmu saat ini.");
  }
};

handler.help = ["hoshino"];
handler.tags = ["ai"];
handler.command = /^(hoshino)$/i;
handler.onlyprem = true;
handler.limit = true;
export default handler;

// Fungsi untuk mendapatkan respons dari API Hoshino
async function getMessage(yourMessage) {
  const headers = {
    'Content-Type': 'application/json',
    'Origin': 'https://www.blackbox.ai',
    'Cookie': 'sessionId=39ff7566-c561-4bb6-a117-a418f6566090'
  };

  const data = {
    "messages": [
      {
        "id": "KlNJ4hiPpDLmo4IjnrScC",
        "content": yourMessage,
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
    const res = await axios.post("https://www.blackbox.ai/api/chat", data, { headers });
    if (res.data && res.data.messages) {
      return res.data.messages[0]?.content || "Maaf kak, aku tidak punya jawaban untuk itu.";
    }
    throw "Respons API tidak valid.";
  } catch (error) {
    console.error("Error:", error.message);
    throw "Terjadi kesalahan saat memproses permintaan.";
  }
}