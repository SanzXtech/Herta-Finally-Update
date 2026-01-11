import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import { fileTypeFromBuffer } from 'file-type';

let handler = async (m, { conn, usedPrefix, command, text }) => {
    if (!text) throw `Contoh: ${usedPrefix + command} halo, gimana kabar mu?`;

    try {
        let formData = new FormData();
        let media = m.quoted ? await m.quoted.download() : await m.download();
        let { mime, ext } = await fileTypeFromBuffer(media);

        if (/image|video|audio|application\/pdf/.test(mime)) {
            let filename = `./file_${Date.now()}.${ext}`;
            fs.writeFileSync(filename, media);

            formData.append('content', text);
            formData.append('model', 'gemini-1.5-flash');
            formData.append('file', fs.createReadStream(filename));

            const response = await axios.post('https://hydrooo.web.id/', formData, {
                headers: {
                    ...formData.getHeaders()
                }
            });

            fs.unlinkSync(filename);
            await m.reply(response.data.result);
        } else {
            formData.append('content', text);
            formData.append('model', 'gemini-1.5-flash');

            const response = await axios.post('https://hydrooo.web.id/', formData, {
                headers: {
                    ...formData.getHeaders()
                }
            });

            await m.reply(response.data.result);
        }

    } catch (error) {
        console.error(error);
        throw error
    }
};

handler.help = ["medusa <teks>"];
handler.tags = ["ai"];
handler.command = /^(medusa)$/i;
handler.limit = true;

export default handler;