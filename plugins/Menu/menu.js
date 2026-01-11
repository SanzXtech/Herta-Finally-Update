const fs = require("fs");
const path = require("path");
const moment = require("moment-timezone");
let {
  generateWAMessageFromContent,
  proto,
  prepareWAMessageMedia,
} = require("baileys");


let handler = async (m, { conn,q, isOwner,setReply }) => {

 // Path ke folder plugins
 const pluginsFolderPath = "./plugins";
 // Daftar folder yang ingin dikecualikan dari perhitungan
 let forOwner = ["Bot-function", "Game-answer", "Game-hint", "Case"];
 let forUser = ["Bot-function", "Game-answer", "Game-hint", "Owner", "Case"];
 const excludedFolders = isOwner ? forOwner : forUser; // Ganti dengan nama folder yang ingin dikecualikan



if(!q){
  function toMonospace(text) {
      return `${text}`;
    }
 

  const timeWib = moment().tz("Asia/Jakarta").format("HH:mm:ss");
  moment.tz.setDefault("Asia/Jakarta").locale("id");

  const more = String.fromCharCode(8206);
  const readmore = more.repeat(4001);

  let dt = moment(Date.now()).tz("Asia/Jakarta").locale("id").format("a");
  const ucapanWaktu = "Selamat " + dt.charAt(0).toUpperCase() + dt.slice(1);

  let dot = new Date(new Date() + 3600000);
  const dateIslamic = Intl.DateTimeFormat("id" + "-TN-u-ca-islamic", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(dot);

  const data = global.db.data.others["newinfo"];
  const info = data ? data.info : "";
  const block = await conn.fetchBlocklist();
  const timeInfo = data ? clockString(new Date() - data.lastinfo) : "tidak ada";

  // Fungsi untuk menghitung jumlah file.js dalam sebuah folder
  function countJSFiles(folderPath) {
    try {
      const files = fs.readdirSync(folderPath); // Baca isi folder secara sinkron
      let jsFileCount = 0;

      files.forEach((file) => {
        const filePath = path.join(folderPath, file);
        const stat = fs.statSync(filePath); // Dapatkan informasi status file

        if (stat.isDirectory()) {
          if (!excludedFolders.includes(file)) {
            jsFileCount += countJSFiles(filePath); // Rekursif untuk folder dalam folder
          }
        } else {
          if (path.extname(file) === ".js") {
            jsFileCount++; // Tambahkan 1 untuk setiap file.js
          }
        }
      });

      return jsFileCount;
    } catch (error) {
      console.error("Error:", error);
      return 0; // Jika terjadi error, kembalikan nilai 0
    }
  }

  // Hitung jumlah file.js dalam semua folder di dalam folder plugins
  const totalJSFiles = countJSFiles(pluginsFolderPath);
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

  const menu = `
  hai kak, herta adalah bot whatsapp multidevice
yang siap membantu aktifitas kamu

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

🆕 *Latest Update :*
▸  ${info}
▸  di update ${timeInfo} yang lalu

> Create By SanzOnly`;

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

  let desc = {
    AI: "Artificial Intelligence",
    Anime: "Japanese animated productions",
    Anonymous: "Unknown or unidentified",
    Asupan: "Supplies or provisions",
    Converter: "Tool to convert one form of data to another",
    Downloader: "Tool for downloading files from the internet",
    Fun: "Enjoyable or entertaining",
    Game: "Activity or sport with defined rules and goals",
    Group: "Collection of individuals or things",
    Info: "Information or details",
    Islamic: "Relating to the religion of Islam",
    Menu: "List of options or choices",
    Maker: "Create an attractive image",
    MongoDB: "A popular NoSQL database program",
    Others: "Additional or different things",
    Owner: "Person or entity that possesses something",
    Quotes: "Repetitions of words or statements made by others",
    RPG: "Role-Playing Game",
    Search: "Act of looking for something",
    "Short-url": "Abbreviated web address",
    Stickers: "Decorative or informative adhesive label",
    Tools: "Instruments or devices used to perform tasks",
    Uploader: "Tool for uploading files or data",
  };

  let rows = [];
  for (let i of outputString) {
    let obj = {
      title: i,
      description: desc[i] ? desc[i] : `No description`,
      id: "!menu " + i.toLowerCase(),
    };
    rows.push(obj);
  }

  let sections = [
    {
      title: "List Menu Herta - V2",
      highlight_label: 'Populer Plugins',
      rows,
    },
  ];


conn.sendMessage(m.chat, {
    document: fs.readFileSync("./package.json"),
    fileName: 'Create By SanzOnly',
    fileLength: "99999999999999",
    pageCount: 99999,
    caption: `${transformText(menu)}`,
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
        { buttonId: "!allmenu", buttonText: { displayText: "Menu All 📄" }, type: 1, viewOnce: true },
        { buttonId: "!owner", buttonText: { displayText: "Owner Bot 👑" }, type: 1, viewOnce: true },
        { 
            buttonId: "action", 
            buttonText: { displayText: "Interactive Menu" },
            type: 4,
            nativeFlowInfo: {
                name: 'single_select',
                paramsJson: JSON.stringify({
                title: 'List Menu',
                sections: sections}),
            },
        },
    ],
    headerType: 1,
    viewOnce: true
}, { quoted: m });


} else {

// Fungsi untuk menampilkan semua nama file tanpa ekstensi dalam sebuah folder
function displayFilesByFolder(folderPath, excludedFolders = [], premium = [], limit = [], error = [], bloked = [], isLast = false) {
  let result = ''; // Inisialisasi string kosong

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
        
      
          result += `▧──···「 *${transformText2(folderName)}* 」···──▧\n\n`; // Tambahkan nama folder ke string result
          const isSubLast = index === files.length - 1 && isLast;
          result += displayFilesByFolder(filePath, excludedFolders, premium, limit, error, bloked, isSubLast); // Rekursif untuk folder dalam folder
      } else if (!isDirectory) {
          let marker = '';
          if (premium.includes(fileNameWithoutExtension)) {
              marker += '  🅟';
          }
          if (limit.includes(fileNameWithoutExtension)) {
              marker += '  🅛';
          }
          if (error.includes(fileNameWithoutExtension)) {
              marker += '  🅔';
          }
          if (bloked.includes(fileNameWithoutExtension)) {
              marker += '  🅑'; // Tambahkan tanda 🅑 jika file ada dalam blokedFiles
          }
          const transformedFileName = transformText(fileNameWithoutExtension); // Transformasikan nama file
          result += `• ${transformedFileName}${marker}\n`; // Tambahkan nama file ke string result

          if (isLastFile) {
              result += '\n'; // Tambahkan penanda akhir folder
          }
      }
  });

  if (!isLast && !result.endsWith('☉\n')) {
      result += '\n\n'; // Tambahkan penanda akhir folder jika bukan folder terakhir
  }

  return result; // Kembalikan string result setelah semua proses selesai
}

// Path ke folder plugins
//const pluginsFolderPath = './plugins';

// Daftar folder yang ingin dikecualikan dari tampilan console
//const excludedFolders = ['Bot-function', 'Game-answer', 'Game-hint']; // Ganti dengan daftar folder yang ingin dikecualikan

// Daftar file premium, limit, error, dan bloked
const premiumFiles = db.data.data.filter(item => item.name === 'premium')[0].id;
const limitFiles = db.data.data.filter(item => item.name === 'limit')[0].id;
const errorFiles = db.data.listerror.map(item => item.cmd);
const blokedFiles = db.data.blockcmd.map(item => item.cmd);

// Memanggil fungsi untuk menampilkan nama file tanpa ekstensi berdasarkan folder
const outputString = displayFilesByFolder(pluginsFolderPath, excludedFolders, premiumFiles, limitFiles, errorFiles, blokedFiles, true);

let links = [
  "https://files.catbox.moe/933mln.jpg",
  //"https://telegra.ph/file/6760f93b4738dd74f69e7.jpg",
  //"https://telegra.ph/file/cafc70df75e5809405014.jpg",
  //"https://telegra.ph/file/07bbaf3357aee91af074b.jpg",
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
  title: `${transformText('Bot WhatsApp Multi Device')}\n${transformText(baileysVersion)}`,
  body:`Runtime ${transformText(runTime)} `,
  mediaType: 1,
  renderLargerThumbnail: true,
  //jpegThumbnail: fs.readFileSync('./media/thumb2.jpg'),
  thumbnail: fs.readFileSync('./media/thumb.jpg'),
  sourceUrl: 'https://whatsapp.com/channel/0029VafEhDUIXnlyGgMSgH2u', //global.myUrl,
  mediaUrl: global.myUrl,
  },
  };
  
  conn.sendMessage(m.chat, {
    document: fs.readFileSync("./package.json"),
    fileName: 'Create By SanzOnly',
    fileLength: "99999999999999",
    pageCount: 99999,
    caption: outputString,
    mimetype: "application/pdf",
    contextInfo: contextInfo,
    buttons: [
        { buttonId: "!menu", buttonText: { displayText: "Back To Menu ↩️" }, type: 1, viewOnce: true },
        { buttonId: "!owner", buttonText: { displayText: "Owner Bot 👑" }, type: 1, viewOnce: true },
    ],
    headerType: 1,
    viewOnce: true // Masukkan contextInfo agar tetap ada
}, { quoted: m });
  

}



};
handler.help = ["all"];
handler.tags = ["internet"];
handler.command = ["menu"];
handler.limit = true;
export default handler;