import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!m.quoted) return m.reply(`Kirim/reply gambar dengan caption *${usedPrefix + command}*`);
    
    let mime = m.quoted.mimetype || "";
    let defaultPrompt = "Transform the character into a high-contrast black-and-white (grayscale) figure with no colors. Place the character centered in the frame, scaled down so there’s empty space around the sides — but the bottom of the character must touch the bottom edge of the image (not floating). Add a solid red background. Cover the eyes with a thick black censor bar horizontally. Add a soft glowing light effect around the character's edges. The overall style should feel minimal, edgy, and modern — similar to viral anime edits. Format must be square (1:1). Do not change the shape or appearance of the original character — just apply the visual transformation described.";

    if (!/image\/(jpe?g|png)/.test(mime)) return m.reply(`Format ${mime} tidak didukung! Hanya jpeg/jpg/png`);

    let promptText = text || defaultPrompt;
    m.reply("SDM TINGGI BJIR😹");

    try {
        let imgData = await m.quoted.download();
        let genAI = new GoogleGenerativeAI("AIzaSyC6afHIuTvycO1gqLIsICjSQN4gBD9ANMg");

        const base64Image = imgData.toString("base64");

        const contents = [
            { text: promptText },
            {
                inlineData: {
                    mimeType: mime,
                    data: base64Image
                }
            }
        ];

        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash-exp-image-generation",
            generationConfig: {
                responseModalities: ["Text", "Image"]
            },
        });

        const response = await model.generateContent(contents);

        let resultImage;
        let resultText = "";

        for (const part of response.response.candidates[0].content.parts) {
            if (part.text) {
                resultText += part.text;
            } else if (part.inlineData) {
                const imageData = part.inlineData.data;
                resultImage = Buffer.from(imageData, "base64");
            }
        }

        if (resultImage) {
            const tempPath = path.join(process.cwd(), "./", `gemini_${Date.now()}.png`);
            fs.writeFileSync(tempPath, resultImage);

            await conn.sendMessage(m.chat, { 
                image: { url: tempPath },
                caption: `*✨ Success Convert Image to Mostchreal*`
            }, { quoted: m });

            setTimeout(() => {
                try {
                    fs.unlinkSync(tempPath);
                } catch {}
            }, 30000);
        } else {
            m.reply("Gagal jadi sdm tinggi😹.");
        }
    } catch (error) {
        console.error(error);
        m.reply(`Error: ${error.message}`);
    }
};

handler.help = ["mostchreal"];
handler.tags = ["ai"];
handler.command = ["mostchreal"];

export default handler;
