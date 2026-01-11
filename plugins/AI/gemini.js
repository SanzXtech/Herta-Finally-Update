import { GoogleGenerativeAI } from "@google/generative-ai";
import { FileUgu2 } from '../../lib/uploader.js';
import { Buffer } from 'buffer';
import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text && !m.quoted) return m.reply(`• *Contoh:* ${usedPrefix + command} selamat pagi`);

    const genAI = new GoogleGenerativeAI("AIzaSyDdfNNmvphdPdHSbIvpO5UkHdzBwx7NVm0");
    const geminiProModel = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const geminiFlashModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || "";
    let prompt = text || (m.quoted && m.quoted.text) || "";

    try {
        let responseText, imageUrl;

        if (mime) {
            // Proses upload gambar ke CloudkuImages
            let fileBuffer = await q.download();
            let ext = mime.split('/')[1] || 'bin';
            let fileName = `upload.${ext}`;

            // Upload file ke Uguu (menggunakan FileUgu2)
            imageUrl = await FileUgu2(fileBuffer);
            if (!imageUrl) return m.reply("⚠️ Gagal mengunggah gambar!");

            // Proses AI dengan gambar
            const imageResp = await fetch(imageUrl).then(res => res.arrayBuffer());
            const imageBase64 = Buffer.from(imageResp).toString("base64");

            let imagePart = {
                inlineData: {
                    data: imageBase64,
                    mimeType: mime
                }
            };

            let result = await geminiProModel.generateContent([imagePart, prompt]);
            responseText = result.response.text();
        } else {
            // Proses teks biasa
            let result = await geminiFlashModel.generateContent(prompt);
            responseText = result.response.text();
        }

        if (!responseText) throw new Error("Response tidak valid dari API");

        await conn.sendMessage(m.chat, {
            text: responseText,
            contextInfo: {
                externalAdReply: {
                    title: 'GEMINI-PRO / VISION',
                    thumbnailUrl: imageUrl || 'https://telegra.ph/file/4bae3d5130aabcbe94588.jpg',
                    sourceUrl: 'https://gemini.google.com',
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m });

    } catch (e) {
        console.error(e);
        m.reply("⚠️ Terjadi kesalahan saat memproses permintaan.");
    }
};

handler.help = ["gemini"];
handler.tags = ["ai"];
handler.command = ["gemini"];

export default handler;
