import axios from "axios";
import BodyForm from "form-data";
import fetch from "node-fetch";
import fs from 'fs-extra'
import FormData from "form-data"
import { fileTypeFromBuffer } from "file-type";
import * as cheerio from "cheerio";
function TelegraPh(Path) {
  return new Promise(async (resolve, reject) => {
    if (!fs.existsSync(Path)) return reject(new Error("File not Found"));
    try {
      const form = new BodyForm();
      form.append("file", fs.createReadStream(Path));
      const data = await axios({
        url: "https://telegra.ph/upload",
        method: "POST",
        headers: {
          ...form.getHeaders(),
        },
        data: form,
      });
      //console.log(data)
      return resolve("https://telegra.ph" + data.data[0].src);
    } catch (err) {
      return reject(new Error(String(err)));
    }
  });
}


async function elegraPh(path) {
    let data = new FormData()
    data.append("file", fs.createReadStream(path))
    let response = await fetch("https://telegra.ph/upload", {
        method: "POST",
        body: data
    })
    return await response.json()
}





async function AnonFiles(path) {
    let data = new FormData()
    data.append("file", fs.createReadStream(path))
    let response = await fetch('https://api.anonfiles.com/upload', {
        method: "POST",
        body: data
    })
    return await response.json()
}



async function FileIo(path) {
  Log(path)
    let data = new FormData()
    data.append("file", fs.createReadStream(path))
    let response = await fetch("https://file.io", {
        method: "POST",
        body: data
    })
    return await response.json()
}



async function FileUgu(path) {
    let data = new FormData()
    data.append("files[]", fs.createReadStream(path))
    let response = await fetch("https://uguu.se/upload.php", {
        method: "POST",
        body: data
    })
    return await response.json()
}

async function FileUgu2(buffer) {
  let data = new FormData();
  data.append("files[]", buffer, "upload.jpg"); // Nama file bisa disesuaikan
  let response = await fetch("https://uguu.se/upload.php", {
      method: "POST",
      body: data
  });

  let res = await response.json()
return res.files[0].url
}

async function FileDitch(path) {
  Log(path)
    let data = new FormData()
    data.append("files[]", fs.createReadStream(path))
    let response = await fetch('https://up1.fileditch.com/upload.php', {
        method: "POST",
        body: data
    })
    return await response.json()
}


async function PomF2(path) {
  Log(path)
    let data = new FormData()
    data.append("files[]", fs.createReadStream(path))
    let response = await fetch("https://pomf2.lain.la/upload.php", {
        method: "POST",
        body: data
    })
    return await response.json()
}


 


 
async function Top4top(buffer) {
  const { ext } = await fileTypeFromBuffer(buffer) || {};
  const form = new FormData();
  
  form.append('file_1_', buffer, {
      filename: `${Math.floor(Math.random() * 10000)}.${ext}`
  });
  form.append('submitr', '[ رفع الملفات ]');

  try {
      const response = await axios.post('https://top4top.io/index.php', form, {
          headers: {
              ...form.getHeaders(),
              'User-Agent': 'Mozilla/5.0 (BlackBerry; U; BlackBerry 9900; en) AppleWebKit/534.11+ (KHTML, like Gecko) Version/7.0.0.585 Mobile Safari/534.11+'
          }
      });

      const $ = cheerio.load(response.data);
      let result = $('div.alert.alert-warning > ul > li > span').find('a').attr('href') || "gagal";

      if (!result || result === "gagal") {
          return {
              status: "error",
              msg: "Maybe file not allowed or try another file"
          };
      }

      return {
          status: "success",
          result
      };

  } catch (error) {
      console.error(error);
      return {
          status: 'error',
          msg: 'An error occurred during the upload process.'
      };
  }
    }

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
    
    async function catbox(buffer) {
      try {
        const { ext } = await fileTypeFromBuffer(buffer);
        const bodyForm = new FormData();
        bodyForm.append("fileToUpload", buffer, `file.${ext}`);
        bodyForm.append("reqtype", "fileupload");
    
        const res = await fetch("https://catbox.moe/user/api.php", {
          method: "POST",
          body: bodyForm,
        });
    
        const data = await res.text();
        return data;
      } catch (error) {
        console.error(error);
        return null;
      }
               }



export { 
AnonFiles,
FileIo,
FileUgu,
FileUgu2,
FileDitch,
PomF2,
Top4top,
tmpFile,
catbox,
TelegraPh
};

import { fileURLToPath, URL } from "url";
const __filename = new URL("", import.meta.url).pathname;
const __dirname = new URL(".", import.meta.url).pathname;
import chalk from "chalk";
let file = fileURLToPath(import.meta.url);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(
    chalk.bgGreen(chalk.black("[  UPDATE ]")),
    chalk.white(`${__filename}`)
  );
  import(`${file}?update=${Date.now()}`);
});
