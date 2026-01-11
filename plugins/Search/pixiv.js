const axios = require("axios");
const { generateWAMessageFromContent, prepareWAMessageMedia,  proto, generateWAMessageContent  } = require("baileys");

let handler = async (m, { conn, usedPrefix, command, text }) => {
	
  if (!text) return m.reply(`• *Example:* ${usedPrefix + command} Mahiru`);
  
  await m.reply(wait);
  
  async function createImage(url) {
    const { imageMessage } = await generateWAMessageContent({
      image: {
        url
      }
    }, {
      upload: conn.waUploadToServer
    });
    return imageMessage;
  }
  
  let push = [];
  let { data } = await axios.get(`https://keila-api.vercel.app/pixiv?q=${encodeURIComponent(text)}`);
  let res = data.result.map(v => v.image);
  
  shuffleArray(res); // Mengacak array
  let ress = res.splice(0, 8); // Mengambil 8 gambar pertama dari array yang sudah diacak
  let i = 1;
  
  for (let kontol of ress) {
    push.push({
      body: proto.Message.InteractiveMessage.Body.fromObject({
        text: `Image - ${i++}`
      }),
      footer: proto.Message.InteractiveMessage.Footer.fromObject({
        text: global.wm
      }),
      header: proto.Message.InteractiveMessage.Header.fromObject({
        title: '', 
        hasMediaAttachment: true,
        imageMessage: await createImage(kontol)
      }),
      nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
        buttons: [
          {
            "name": "cta_url",
            "buttonParamsJson": `{"display_text":"Source 🔍","url":"https://www.pixiv.net/en/tags/${encodeURIComponent(text)}","merchant_url":"https://www.pixiv.net/en/tags/${encodeURIComponent(text)}"}`
          }
        ]
      })
    });
  }
  
  const bot = generateWAMessageFromContent(m.chat, {
    viewOnceMessage: {
      message: {
        messageContextInfo: {
          deviceListMetadata: {},
          deviceListMetadataVersion: 2
        },
        interactiveMessage: proto.Message.InteractiveMessage.fromObject({
          body: proto.Message.InteractiveMessage.Body.create({
            text: ""
          }),
          footer: proto.Message.InteractiveMessage.Footer.create({
            text: 'Result from: ' + text,
          }),
          header: proto.Message.InteractiveMessage.Header.create({
            hasMediaAttachment: false
          }),
          carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
            cards: [
              ...push
            ]
          })
        })
      }
    }
  }, {quoted: m});
  
  await conn.relayMessage(m.chat, bot.message, {
    messageId: bot.key.id
  });
}

handler.help = ["pix", "pixiv"];
handler.tags = ["internet", "search"];
handler.command = /^pix(iv)?$/i;
handler.limit = true;

export default handler;

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
