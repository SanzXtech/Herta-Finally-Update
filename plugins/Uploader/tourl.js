import axios from 'axios';
import FormData from 'form-data';
import { fileTypeFromBuffer } from "file-type";
import fs from "fs";
import fetch from 'node-fetch';

let handler = async (m) => {
  let q = m.quoted ? m.quoted : m;
  let mime = (q.msg || q).mimetype || '';
  if (!mime) throw 'No media found';
  let media = await q.download();

  let link = await tmpFile(media);
  let link2 = await catbox(media);

  m.reply(`
*Upload Tmp files*
*Link:* ${link}
*Size:* ${media.length} Byte
*Expired:* _2 hour_

*Upload Catbox*
*Link* : ${link2}
*Size* : ${media.length} Byte
*Expired:* _not expired_
`);
}

handler.help = ["tourl"];
handler.tags = ["uploader"];
handler.command = /^(tourl)$/i;
handler.limit = true;
handler.register = false;

export default handler;

const tmpFile = (buffer) => {
  return new Promise(async (resolve, reject) => {
    const { ext, mime } = await fileTypeFromBuffer(buffer);
    const form = new FormData();
    form.append("file", buffer, {
      filename: new Date() * 1 + "." + ext,
      contentType: mime,
    });

    axios
      .post("https://tmpfiles.org/api/v1/upload", form, {
        headers: {
          ...form.getHeaders(),
        },
      })
      .then((response) => {
        const url = new URL(response.data.data.url);
        resolve("https://tmpfiles.org/dl" + url.pathname);
      })
      .catch((error) => {
        resolve(error?.response);
      });
  });
};

async function catbox(media) {
  return new Promise(async (resolve, reject) => {
    const formData = new FormData();
    formData.append('reqtype', 'fileupload');
    formData.append('userhash', ''); // Masukkan UserHash Anda di sini jika diperlukan
    formData.append('fileToUpload', media, { 
      filename: new Date() * 1 + '.jpg' 
    });
    axios.post('https://catbox.moe/user/api.php', formData, {
      headers: {
        ...formData.getHeaders(),
      },
    })
    .then((response) => {
      resolve(response.data);
    })
    .catch((error) => {
      resolve(error?.response?.data || "Upload failed");
    });
  });
}
