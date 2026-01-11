import stream from 'stream';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { TelegraPh, FileUgu } from '../../lib/uploader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function enhanceVideo(inputBuffer) {
    return new Promise((resolve, reject) => {
        const tempDir = path.join(__dirname, 'temp');
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

        const tempInputPath = path.join(tempDir, `input_${Date.now()}.mp4`);
        const tempOutputPath = path.join(tempDir, `output_${Date.now()}.mp4`);
        fs.writeFileSync(tempInputPath, inputBuffer);

        ffmpeg(tempInputPath)
            .videoFilter('eq=contrast=1.2:brightness=0.1')
            .output(tempOutputPath)
            .on('start', commandLine => {
                console.log('FFmpeg command: ', commandLine);
            })
            .on('progress', progress => {
                console.log('Processing: ', progress);
            })
            .on('end', () => {
                try {
                    const outputBuffer = fs.readFileSync(tempOutputPath);
                    resolve(outputBuffer);
                } catch (err) {
                    reject('Failed to read output file: ' + err);
                } finally {
                    fs.unlinkSync(tempInputPath);
                    fs.unlinkSync(tempOutputPath);
                }
            })
            .on('error', (err) => {
                console.error('FFmpeg error: ', err);
                reject('FFmpeg processing failed: ' + err.message);
                try {
                    fs.unlinkSync(tempInputPath);
                    if (fs.existsSync(tempOutputPath)) fs.unlinkSync(tempOutputPath);
                } catch (cleanupErr) {
                    console.error('Failed to clean up files: ', cleanupErr);
                }
            })
            .run();
    });
}

export async function handleVideoCommand(m, conn, mime, prefix, command, quoted) {
    if (!/video/.test(mime)) {
        return m.reply(`Kirim/kutip video dengan caption ${prefix + command}`);
    }
    await conn.sendMessage(m.chat, { react: { text: "🔎", key: m.key } });
    let media = await quoted.download();

    try {
        let processedVideo = await enhanceVideo(media);
        await conn.sendMessage(m.chat, { video: processedVideo, caption: 'Sukses' }, { quoted: m });
    } catch (error) {
        console.error('Error processing video: ', error);
        m.reply('Terjadi kesalahan saat memproses video: ' + error);
    }
}

export async function handleToUrlCommand(m, conn, mime, prefix, command, isMediaa, quoted) {
    if (!isMediaa) return m.reply(`Kirim video/gambar dengan caption ${prefix + command}`);
    
    let media = await conn.downloadAndSaveMediaMessage(quoted);
    conn.sendMessage(m.chat, { react: { text: `🔎`, key: m.key }});
    
    let anu;
    if (/image/.test(mime)) {
        anu = await TelegraPh(media);
    } else if (/video/.test(mime)) {
        anu = await TelegraPh(media);
    } else if (!/image/.test(mime)) {
        anu = await UploadFileUgu(media);
    }

    m.reply(`Link: ${anu.url ? anu.url : anu}`);
    await fs.unlinkSync(media);
}

let handler = async (m, { conn, usedPrefix, command }) => {
    let mime = m.quoted ? m.quoted.mimetype : m.mimetype;
    if (command === 'hdvideo') {
        await handleVideoCommand(m, conn, mime, usedPrefix, command, m.quoted);
    }
};

handler.help = ["hdvid", "hdvideo"];
handler.tags = ["ai"];
handler.command = /^(hdvideo|hdvid)$/i;

export default handler;
