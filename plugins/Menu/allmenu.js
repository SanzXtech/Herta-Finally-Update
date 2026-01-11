const fs = require("fs");
const path = require("path");
const moment = require("moment-timezone");
const { generateWAMessageFromContent,prepareWAMessageMedia, proto } = require("baileys");

let handler = async (m, { conn, q, isOwner, setReply }) => {
  // Path ke folder plugins
  const pluginsFolderPath = "./plugins";
  
  // Daftar folder yang ingin dikecualikan berdasarkan role (Owner / User)
  let forOwner = ['Bot-function', 'Game-answer', 'Game-hint','Case']
  let forUser = ['Bot-function', 'Game-answer','Game-hint','Owner','Case']
  const excludedFolders = isOwner ? forOwner : forUser; // Menentukan folder yang dikecualikan berdasarkan role
  
  // Jika query kosong, tampilkan informasi menu
  if (!q) {
    function toMonospace(text) {
      return `${text}`;
    }

    // Waktu di zona WIB
    const timeWib = moment().tz("Asia/Jakarta").format("HH:mm:ss");
    moment.tz.setDefault("Asia/Jakarta").locale("id");

    const more = String.fromCharCode(8206);
    const readmore = more.repeat(4001); // Pembatas untuk membaca lebih lanjut

    let dt = moment(Date.now()).tz("Asia/Jakarta").locale("id").format("a");
    const ucapanWaktu = "Selamat " + dt.charAt(0).toUpperCase() + dt.slice(1);

    let dot = new Date(new Date() + 3600000);
    const dateIslamic = Intl.DateTimeFormat("id-TN-u-ca-islamic", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(dot);
// TAHUN BARU
let sekarang = moment().tz('Asia/Jakarta');
let tahunDepan = sekarang.year() + 1;
let tahunBaru = moment.tz(`${tahunDepan}-01-01 00:00:00`, 'Asia/Jakarta');
let selisih = moment.duration(tahunBaru.diff(sekarang));
let hari = Math.floor(selisih.asDays());
let jam = selisih.hours();
let menit = selisih.minutes();
let detik = selisih.seconds();
let ucapanTahunBaru = `Menuju tahun baru: ${hari} hari, ${jam} jam, ${menit} menit, dan ${detik} detik lagi.`;

    const data = global.db.data.others["newinfo"];
    const info = data ? data.info : "";
    const block = await conn.fetchBlocklist();
    const timeInfo = data ? clockString(new Date() - data.lastinfo) : "tidak ada";
const publik = `${global.public}`
    // Fungsi untuk menghitung jumlah file .js dalam sebuah folder
    function countJSFiles(folderPath) {
      try {
        const files = fs.readdirSync(folderPath); // Baca isi folder secara sinkron
        let jsFileCount = 0;

        files.forEach((file) => {
          const filePath = path.join(folderPath, file);
          const stat = fs.statSync(filePath); // Dapatkan status file

          if (stat.isDirectory()) {
            if (!excludedFolders.includes(file)) {
              jsFileCount += countJSFiles(filePath); // Rekursif ke folder dalam folder
            }
          } else {
            if (path.extname(file) === ".js") {
              jsFileCount++; // Tambah 1 jika file berformat .js
            }
          }
        });

        return jsFileCount;
      } catch (error) {
        console.error("Error:", error);
        return 0; // Jika error, kembalikan nilai 0
      }
    }

    // Hitung jumlah file .js dalam folder plugins
    const totalJSFiles = countJSFiles(pluginsFolderPath);

    // Hitung jumlah case yang ada di file case.js
    const totalCase = () => {
      try {
        const mytext = fs.readFileSync("./plugins/Case/case.js", "utf8");
        const numCases = (mytext.match(/(?<!\/\/)(case\s+['"][^'"]+['"])/g) || [])
          .length;
        return numCases;
      } catch (err) {
        console.error("Error:", err);
        return 0;
      }
    };

            

 
    // Menu yang ditampilkan kepada pengguna
    const menu =`
hai, herta adalah bot whatsapp multidevice yang siap membantu aktifitas kamu

📊 *Stats :*
▸ Running on: ${runWith}

▸ Features: ${totalJSFiles+totalCase()}
▸ Errors: ${db.data.listerror.length}
▸ Users: ${Object.keys(db.data.users).length}
▸ Banned: ${db.data.banned.length}
▸ Blocked: ${block.length}
▸ Premium: ${Object.values(db.data.users).filter((u) => u.premiumTime !== 0).length}
▸ Blocked Commands: ${db.data.blockcmd.length}

⚠ *Warning :*
▸ 🅟 : Premium 
▸ 🅛 : Limit
▸ 🅔 : Error
▸ 🅑 : Blocked

⛩️ *date & time:*
    
ﾒ ${toMonospace(week + ', ' + calender)}
ﾒ ${toMonospace(timeWib + ' WIB')}
ﾒ ${toMonospace(dateIslamic)}

⛩️ *pilih list menu berikut*

╭──┈  「 LIST MENU 」
│ ◦ ${toMonospace('.allmenu')}
│ ◦ ${toMonospace('.menu menu')} 
│ ◦ ${toMonospace('.menu ai')}
│ ◦ ${toMonospace('.menu anime')}
│ ◦ ${toMonospace('.menu asupan')}
│ ◦ ${toMonospace('.menu converter')}
│ ◦ ${toMonospace('.menu downloader')}
│ ◦ ${toMonospace('.menu fun')}
│ ◦ ${toMonospace('.menu game')}
│ ◦ ${toMonospace('.menu group')}
│ ◦ ${toMonospace('.menu info')}
│ ◦ ${toMonospace('.menu islamic')}
│ ◦ ${toMonospace('.menu owner')}
│ ◦ ${toMonospace('.menu quotes')}
│ ◦ ${toMonospace('.menu rpg')}
│ ◦ ${toMonospace('.menu search')}
│ ◦ ${toMonospace('.menu shorturl')}
│ ◦ ${toMonospace('.menu tools')}
│ ◦ ${toMonospace('.menu uploader')}
╰───···
🆕 *Latest Update :*
▸  ${info}
▸  di update ${timeInfo} yang lalu

`;
function displayFilesByFolderAll(folderPath, excludedFolders = [], premium = [], limit = [], error = [], bloked = [], isLast = false) {
    let result = ''; // Inisialisasi string kosong

    const filesAll = fs.readdirSync(folderPath);
    filesAll.forEach((file, index) => {
        const filePathAll = path.join(folderPath, file);
        const statAll = fs.statSync(filePathAll);
        const isDirectoryAll = statAll.isDirectory();
        const folderNameAll = isDirectoryAll ? path.basename(filePathAll) : '';
        const fileNameWithoutExtensionAll = isDirectoryAll ? '' : path.parse(file).name;
        const isLastFileAll = index === filesAll.length - 1 && !isDirectoryAll && isLast;

        if (isDirectoryAll && !excludedFolders.includes(folderNameAll)) {
            result += `▧──···「 *${transformText(folderNameAll)}* 」\n`; // Tambahkan nama folder ke string result
            const isSubLast = index === filesAll.length - 1 && isLast;
            result += displayFilesByFolderAll(filePathAll, excludedFolders, premium, limit, error, bloked, isSubLast); // Rekursif untuk folder dalam folder
        } else if (!isDirectoryAll) {
            let marker = '';
            if (premium.includes(fileNameWithoutExtensionAll)) {
                marker += '  🅟';
            }
            if (limit.includes(fileNameWithoutExtensionAll)) {
                marker += '  🅛';
            }
            if (error.includes(fileNameWithoutExtensionAll)) {
                marker += '  🅔';
            }
            if (bloked.includes(fileNameWithoutExtensionAll)) {
                marker += '  🅑'; // Tambahkan tanda 🅑 jika file ada dalam blokedFiles
            }
            const transformedFileNameAll = transformText(fileNameWithoutExtensionAll); // Transformasikan nama file
            result += `• ${transformedFileNameAll}${marker}\n`; // Tambahkan nama file ke string result

            if (isLastFileAll) {
                result += '\n'; 
            }
        }
    });

    if (!isLast && !result.endsWith('☉\n')) {
        result += '\n\n'; 
    }

    return result; 
}


const premiumFilesAll = db.data.data.filter(item => item.name === 'premium')[0].id;
const limitFilesAll = db.data.data.filter(item => item.name === 'limit')[0].id;
const errorFilesAll = db.data.listerror.map(item => item.cmd);
const blokedFilesAll = db.data.blockcmd.map(item => item.cmd);

const outputStringAll = displayFilesByFolderAll(pluginsFolderPath, excludedFolders, premiumFilesAll, limitFilesAll, errorFilesAll, blokedFilesAll, true);
const menuAll = `
hai, herta adalah bot whatsapp multidevice yang siap membantu aktifitas kamu

📊 *Stats :*
▸ Running on: ${runWith}
▸
▸ Features: ${totalJSFiles+totalCase()}
▸ Errors: ${db.data.listerror.length}
▸ Users: ${Object.keys(db.data.users).length}
▸ Banned: ${db.data.banned.length}
▸ Blocked: ${block.length}
▸ Premium: ${Object.values(db.data.users).filter((u) => u.premiumTime !== 0).length}
▸ Blocked Commands: ${db.data.blockcmd.length}

⚠ *Warning :*
▸ 🅟 : Premium 
▸ 🅛 : Limit
▸ 🅔 : Error
▸ 🅑 : Blocked

⛩️ *date & time:*
    
ﾒ ${toMonospace(week + ', ' + calender)}
 ﾒ ${toMonospace(timeWib + ' WIB')}
 ﾒ ${toMonospace(dateIslamic)}

🆕 *Latest Update :*
▸  ${info}
▸  di update ${timeInfo} yang lalu

]––––––『 *Commands* 』––––––[


`
   // Fungsi untuk menampilkan semua nama file tanpa ekstensi dalam sebuah folder
  function displayFilesByFolder(folderPath, excludedFolders = []) {
    let result = []; // Inisialisasi string kosong

    const files = fs.readdirSync(folderPath);
    files.forEach((file, index) => {
      const filePath = path.join(folderPath, file);
      const stat = fs.statSync(filePath);
      const isDirectory = stat.isDirectory();
      const folderName = isDirectory ? path.basename(filePath) : "";

      if (isDirectory && !excludedFolders.includes(folderName)) {
        result.push(folderName);
      }
    });

    return result; // JSON.stringify([result]); ; // Kembalikan string result setelah semua proses selesai
  }

  // Memanggil fungsi untuk menampilkan nama file tanpa ekstensi berdasarkan folder
  const outputString = displayFilesByFolder(pluginsFolderPath, excludedFolders);
var setmenu = db.data.settings['settingbot'].setmenu

if (setmenu === "document") {
  conn.sendMessage(m.chat, {
    document: fs.readFileSync("./package.json"),
    fileName: 'Create By SanzOnly',
    fileLength: "99999999999999",
    pageCount: 99999,
    caption: transformText(menuAll) + readmore + outputStringAll,
    mimetype: "application/pdf",
    contextInfo: {
      externalAdReply: {
        title: `${transformText('Bot WhatsApp Multi Device')}\n${transformText(baileysVersion)}`,
        body: `Runtime ${transformText(runTime)}`,
        thumbnail: fs.readFileSync("./media/thumb.jpg"),
        showAdAttribution: false,
        renderLargerThumbnail: true,
        mediaType: 1,
        mediaUrl: "",
        sourceUrl: `https://whatsapp.com/channel/0029VafEhDUIXnlyGgMSgH2u`,
      },
    },
    footer: "_Powered By Nodejs_",
    buttons: [
      { buttonId: "!menu", buttonText: { displayText: "Back To Menu ↩️" }, type: 1, viewOnce: true },
      { buttonId: "!owner", buttonText: { displayText: "Owner Bot 👑" }, type: 1, viewOnce: true },
    ],
    headerType: 1,
    viewOnce: true
  }, { quoted: m });
  await sleep(1500)
  conn.sendMessage(m.chat, { audio: { url: 'https://pomf2.lain.la/f/y504o26b.jpg' }, mimetype: 'audio/mp4' }, { quoted: m });

} else if (setmenu === "livelocation") {
conn.relayMessage(m.chat, { liveLocationMessage: { 
degreesLatitude: 35.676570,
degreesLongitude: 139.762148,
caption :transformText(menuAll) + readmore + outputStringAll,
sequenceNumber: 1656662972682001, timeOffset: 8600, 
jpegThumbnail: null,
contextInfo: {
mentionedJjd: [m.sender],
externalAdReply: {
containsAutoReply: true,
showAdAttribution: true,
}
}
}
}, {quoted: m})
await sleep(1500)
conn.sendMessage(m.chat, { audio: { url: 'https://pomf2.lain.la/f/y504o26b.jpg' }, mimetype: 'audio/mp4' }, { quoted: m });

} else if (setmenu == "payment"){
let numb = ["7.76","15.48","8.92","10.72","13.48","4.39","5.99","2.56"]
let amont = numb[Math.floor(Math.random() * numb.length)]
conn.relayMessage(m.chat,  {
requestPaymentMessage : {
expiryTimestamp: 0,												
currencyCodeIso4217: 'USD',
amount1000: (amont) * 1000,
requestFrom: `${m.sender.split('@')[0]}@s.whatsapp.net`,
noteMessage: {
extendedTextMessage: {
text : transformText(menuAll) + readmore + outputStringAll,
contextInfo: {
mentionedJid: [m.sender],
externalAdReply: {
showAdAttribution: true,
}
}
}
}
}
}, {})
await sleep(1500)
conn.sendMessage(m.chat, { audio: { url: 'https://pomf2.lain.la/f/y504o26b.jpg' }, mimetype: 'audio/mp4' }, { quoted: m });

 } else if (setmenu == "image"){
conn.sendMessage(m.chat, { contextInfo: { externalAdReply: { showAdAttribution: true,
title: `${botName}`,
body:`${baileysVersion}`,
previewType:"PHOTO", 
thumbnailUrl: "https://pomf2.lain.la/f/ea0rhfo5.jpg",
sourceUrl:sgc
}}, image: fs.readFileSync('./media/thumb.jpg'), text: transformText(menuAll) + readmore + outputStringAll
    }, { quoted: m });
await sleep(1500)
conn.sendMessage(m.chat, { audio: { url: 'https://pomf2.lain.la/f/y504o26b.jpg' }, mimetype: 'audio/mp4' }, { quoted: m });

 } else if (setmenu == "thumbnail"){
conn.sendMessage(m.chat, { contextInfo: {
            externalAdReply: {
                showAdAttribution: true, 
                title: `${ucapanWaktu} kak ${m.pushname}`,
                body: `${runTime}`,
                mediaType: 1,  
                renderLargerThumbnail: true,
                thumbnailUrl: "https://pomf2.lain.la/f/ea0rhfo5.jpg",
                sourceUrl: sgc
            },
            editKey: { 
                remoteJid: m.sender, 
                id: 'some_unique_message_id'  
            }
        },
        text: transformText(menuAll) + readmore + outputStringAll,
    }, { quoted: m });
    await sleep(1500)
conn.sendMessage(m.chat, { audio: { url: 'https://pomf2.lain.la/f/y504o26b.jpg' }, mimetype: 'audio/mp4' }, { quoted: m });

} else if (setmenu == "gif"){
conn.sendMessage(m.chat, { 
    video: fs.readFileSync('./media/video.mp4'),
    gifPlayback: true,
    caption: transformText(menuAll) + readmore + outputStringAll,
}, { quoted: m });
await sleep(1500)
conn.sendMessage(m.chat, { audio: { url: 'https://pomf2.lain.la/f/y504o26b.jpg' }, mimetype: 'audio/mp4' }, { quoted: m });

} else if (setmenu == "katalog"){
 const { generateWAMessageFromContent } = require("baileys")
let prep = generateWAMessageFromContent(m.chat, { orderMessage: { 
itemCount: `90000`, status: 500,
surface: 999,
message: transformText(menuAll) + readmore + outputStringAll,
description: '^^',
orderTitle: 'ʙᴇᴊɪʀ ᴅᴇᴋ',
token: '120363212768920223@g.us',
mediaType: 1,
curreyCode: 'IDR',
totalCurrencyCode: 'ʙᴇᴊɪʀ ᴅᴇᴋ',
totalAmount1000: '50000',
sellerJid: '6281316643491@s.whatsapp.net',
thumbnail: fs.readFileSync('./media/thumb.jpg'), 
//thumbnaiUrl: pickRandom(fotoRandom)
}}, {contextInfo:{ externalAdReply: {
showAdAttribution: true, 
title: `${ucapanWaktu} kak ${m.pushname}`,
body: `${runTime}`,
mediaType: 1,  
renderLargerThumbnail : true,
thumbnailUrl:"https://pomf2.lain.la/f/ea0rhfo5.jpg",
sourceUrl: sgc}},quoted: m})
conn.relayWAMessage(prep)
await sleep(1500)
conn.sendMessage(m.chat, { audio: { url: 'https://pomf2.lain.la/f/y504o26b.jpg' }, mimetype: 'audio/mp4' }, { quoted: m });

    } else if (setmenu === "button") {
conn.sendMessage(m.chat, {
  image: { url: 'https://files.catbox.moe/9rgb6l.jpg' },
  caption: transformText(menuAll) + readmore + outputStringAll,
  footer: "SanzOnly ©2025",
  buttons: [
  {
    buttonId: "!owner", 
    buttonText: { 
      displayText: 'OWNER 👑' 
    }
  }, {
    buttonId: "!rules", 
    buttonText: {
      displayText: "RULES 💌"
    }
  }
],
  viewOnce: true,
  headerType: 6,
}, { quoted: m });

    } else if (setmenu == "document"){
conn.sendMessage(m.chat, {
document: fs.readFileSync("./package.json"),
fileName: copyright,
mimetype: "application/vnd.ms-powerpoint",
jpegThumbnail:fs.readFileSync("./media/thumb.jpg"),
caption: transformText(menuAll) + readmore + outputStringAll,
contextInfo: {
externalAdReply: {
showAdAttribution: true,
title: `${ucapanWaktu} kak ${m.pushname}`,
body: `${runTime}`,
thumbnail: fs.readFileSync('./media/thumb.jpeg'),
thumbnailUrl:await "https://pomf2.lain.la/f/ea0rhfo5.jpg",
sourceUrl: sgc,
mediaType: 1,
renderLargerThumbnail: true 
}}}, { quoted: m,ephemeralExpiration: 86400});
await sleep(1500)
conn.sendMessage(m.chat, { audio: { url: 'https://pomf2.lain.la/f/y504o26b.jpg' }, mimetype: 'audio/mp4' }, { quoted: m });

} else if (setmenu === "docImage") {
let msg = generateWAMessageFromContent(
  m.chat,
  {
    viewOnceMessage: {
      message: {
        "messageContextInfo": {
          "deviceListMetadata": {},
          "deviceListMetadataVersion": 2
        },
        interactiveMessage: proto.Message.InteractiveMessage.create({
          contextInfo: {
            mentionedJid: [m.sender],
            forwardingScore: 999999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid,
              newsletterName,
              serverMessageId: 145
            },
            businessMessageForwardInfo: {
              businessOwnerJid: conn.user.id
            },
            externalAdReply: {
              title: `${ucapanWaktu} kak ${m.pushname}`,
              body: `${runTime}`,
              thumbnailUrl: 'https://pomf2.lain.la/f/ea0rhfo5.jpg',
              sourceUrl: sgc,
              mediaType: 1,
              renderLargerThumbnail: true
            }
          },
          body: proto.Message.InteractiveMessage.Body.create({
            text: transformText(menuAll) + readmore + outputStringAll,
          }),
          footer: proto.Message.InteractiveMessage.Footer.create({
            text: "ᴊᴇᴅᴀ ʙᴏᴛ ᴊɪᴋᴀ ᴛɪᴅᴀᴋ ᴍᴇʀᴇꜱᴩᴏɴ",
          }),
          header: proto.Message.InteractiveMessage.Header.create({
            title: ``,
            thumbnailUrl: "",
            gifPlayback: true,
            subtitle: "",
            hasMediaAttachment: true,
            ...(await prepareWAMessageMedia({
              document: fs.readFileSync('./media/thumb.jpg'),
              mimetype: "image/png",
              fileLength: 99999999999999,
              jpegThumbnail: fs.readFileSync('./media/thumb.jpg'),
              fileName: `${m.pushname}`,
            }, {
              upload: conn.waUploadToServer
            }))
          }),
          gifPlayback: true,
          nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
            buttons: [] // No buttons needed
          })
        }),
      }
    }
  },
  { quoted: m }
);


    await conn.relayMessage(msg.key.remoteJid, msg.message, {
      messageId: msg.key.id,
    });
    await sleep(1500)
conn.sendMessage(m.chat, { audio: { url: 'https://pomf2.lain.la/f/y504o26b.jpg' }, mimetype: 'audio/mp4' }, { quoted: m });
    }
  } else {

// Fungsi untuk menampilkan semua nama file tanpa ekstensi dalam sebuah folder
function displayFilesByFolder(folderPath, excludedFolders = [], premium = [], limit = [], error = [], bloked = [], isLast = false) {
  let result = '';  // Ganti link ini dengan link audio Anda
    // Inisialisasi string kosong

  const files = fs.readdirSync(folderPath);
  files.forEach((file, index) => {
      const filePath = path.join(folderPath, file);
      const stat = fs.statSync(filePath);
      const isDirectory = stat.isDirectory();
      const folderName = isDirectory ? path.basename(filePath) : '';
      const fileNameWithoutExtension = isDirectory ? '' : path.parse(file).name;
      const isLastFile = index === files.length - 1 && !isDirectory && isLast;
      //log(folderName)
      //log(q)
      
      if (isDirectory && folderName.toLowerCase() == q) { //!excludedFolders.includes(folderName)
        
      
          result += `${transformText(`╭─┈ ▣ ${folderName} ▣┈────⊡`)}\n`; // Tambahkan nama folder ke string result
          const isSubLast = index === files.length - 1 && isLast;
          result += displayFilesByFolder(filePath, excludedFolders, premium, limit, error, bloked, isSubLast); // Rekursif untuk folder dalam folder
      } else if (!isDirectory) {
          let marker = '';
          if (premium.includes(fileNameWithoutExtension)) {
              marker += ' 🅟';
          }
          if (limit.includes(fileNameWithoutExtension)) {
              marker += ' 🅛';
          }
          if (error.includes(fileNameWithoutExtension)) {
              marker += ' 🅔';
          }
          if (bloked.includes(fileNameWithoutExtension)) {
              marker += ' 🅑'; // Tambahkan tanda jika file ada dalam blokedFiles
          }
          let Twkns = transformText(fileNameWithoutExtension);
          const transformedFileName = `╰◈ .${Twkns}`; // Transformasikan nama file
          result += `${transformedFileName}${marker}\n`; // Tambahkan nama file ke string result

          if (isLastFile) {
              result += '\n'; // Tambahkan penanda akhir folder
          }
      }
  });

  if (!isLast && !result.endsWith('\n')) {
      result += '\n\n'; // Tambahkan penanda akhir folder jika bukan folder terakhir
  }

  return result; // Kembalikan string result setelah semua proses selesai
}


const premiumFiles = db.data.data.filter(item => item.name === 'premium')[0].id;
const limitFiles = db.data.data.filter(item => item.name === 'limit')[0].id;
const errorFiles = db.data.listerror.map(item => item.cmd);
const blokedFiles = db.data.blockcmd.map(item => item.cmd);

// Memanggil fungsi untuk menampilkan nama file tanpa ekstensi berdasarkan folder
const outputString = displayFilesByFolder(pluginsFolderPath, excludedFolders, premiumFiles, limitFiles, errorFiles, blokedFiles, true);

let links = [
  "https://pomf2.lain.la/f/ea0rhfo5.jpg",
  ];
  
  const contextInfo = {
forwardingScore: 1,
isForwarded: true,
containsAutoReply: true,
mentionedJid: [m.sender],
forwardedNewsletterMessageInfo: {
newsletterJid,
serverMessageId: 100,
newsletterName,
},
businessMessageForwardInfo: {
businessOwnerJid: m.botNumber,
},
externalAdReply: {
title: `${transformText('Bot WhatsApp Multi Device')}
${transformText(baileysVersion)}`,
body:`Runtime ${transformText(runTime)} `,
mediaType: 1,
renderLargerThumbnail: true,
thumbnailUrl: links.getRandom(),
//jpegThumbnail: fs.readFileSync('./media/thumb2.jpg'),
thumbnail: fs.readFileSync('./media/thumb.jpg'),
sourceUrl: 'https://whatsapp.com/channel/0029VafEhDUIXnlyGgMSgH2u', //global.myUrl,
mediaUrl: global.myUrl,
},
};
  
  conn.sendMessage(m.chat,{ contextInfo, mentions: [m.sender], text: outputString});

}

};

handler.help = ["all"];
handler.tags = ["internet"];
handler.command = ["allmenu"];
export default handler