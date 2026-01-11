import { generateWAMessageContent, generateWAMessageFromContent, proto } from 'baileys';

let pint = async (query) => {
  const response = await fetch("https://www.pinterest.com/resource/BaseSearchResource/get/?data=" + encodeURIComponent('{"options":{"query":"' + encodeURIComponent(query) + '"}}'), {
    "headers": {
      "screen-dpr": "4",
      "x-pinterest-pws-handler": "www/search/[scope].js",
    },
    "method": "head"
  });
  if (!response.ok) throw Error(`error ${response.status} ${response.statusText}`);
  const rhl = response.headers.get("Link");
  if (!rhl) throw Error(`Hasil pencarian *${query}* kosong.`);
  const links = [...rhl.matchAll(/<(.*?)>/gm)].map(v => v[1]);
  return links;
};

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return conn.reply(m.chat, `• *Example:* ${usedPrefix + command} furina`, m, { quoted: fkontak });

  let fkontak = {
    key: {
      fromMe: false,
      participant: "0@s.whatsapp.net",
      ...(m.chat ? { remoteJid: m.chat } : {})
    },
    message: {
      contactMessage: {
        displayName: "Pinterest Bot",
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;Pinterest Bot;;;\nFN:Pinterest Bot\nitem1.TEL;waid=0:0\nitem1.X-ABLabel:Pinterest\nEND:VCARD`
      }
    }
  };

  await conn.sendMessage(m.chat, { text: `🔎 Sedang mencari gambar untuk: *${text}*`, mentions: [m.sender] }, { quoted: fkontak });

  let urls = await pint(text);
  if (!urls || urls.length === 0) throw 'Gagal mendapatkan gambar dari Pinterest.';

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  shuffleArray(urls);
  let top5 = urls.slice(0, 5);
  let cards = [];
  let index = 1;

  async function createImage(url) {
    const { imageMessage } = await generateWAMessageContent({
      image: { url }
    }, {
      upload: conn.waUploadToServer
    });
    return imageMessage;
  }

  for (let url of top5) {
    cards.push({
      body: proto.Message.InteractiveMessage.Body.fromObject({
        text: `✨ Hasil pencarian #${index++}`
      }),
      footer: proto.Message.InteractiveMessage.Footer.fromObject({
        text: '乂 P I N T E R E S T'
      }),
      header: proto.Message.InteractiveMessage.Header.fromObject({
        title: 'Pinterest Search',
        hasMediaAttachment: true,
        imageMessage: await createImage(url)
      }),
      nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
        buttons: [
          {
            name: 'cta_url',
            buttonParamsJson: `{"display_text":"🌐 Lihat di Pinterest","url":"https://www.pinterest.com/search/pins/?rs=typed&q=${encodeURIComponent(text)}","merchant_url":"https://www.pinterest.com/search/pins/?rs=typed&q=${encodeURIComponent(text)}"}`
          }
        ]
      })
    });
  }

  const msg = generateWAMessageFromContent(m.chat, {
    viewOnceMessage: {
      message: {
        messageContextInfo: {
          deviceListMetadata: {},
          deviceListMetadataVersion: 2
        },
        interactiveMessage: proto.Message.InteractiveMessage.fromObject({
          body: proto.Message.InteractiveMessage.Body.create({
            text: `🔍 Berikut hasil pencarian dari *${text}*`
          }),
          footer: proto.Message.InteractiveMessage.Footer.create({
            text: '乂 P I N T E R E S T'
          }),
          header: proto.Message.InteractiveMessage.Header.create({
            hasMediaAttachment: false
          }),
          carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
            cards
          })
        })
      }
    }
  }, {});

  await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
};

handler.help = ["pinterestgeser", "pinterestv2"];
handler.tags = ["search", "premium"];
handler.command = /^(pinterestgeser|pinterestv2)$/i;
handler.premium = true;

export default handler;