import axios from "axios";
import fs from 'fs-extra';
import { exec } from "child_process";
const { FileIo, FileUgu, TelegraPh, AnonFiles, FileDitch, PomF2, Top4top } =
  await import(`../../lib/uploader.js?v=${Date.now()}`).catch((err) =>
    console.log(err)
  );

// Daftar warna yang didukung
const colorCodes = {
  aliceblue: "#F0F8FF",
  antiquewhite: "#FAEBD7",
  aqua: "#00FFFF",
  aquamarine: "#7FFFD4",
  azure: "#F0FFFF",
  beige: "#F5F5DC",
  bisque: "#FFE4C4",
  black: "#000000",
  blanchedalmond: "#FFEBCD",
  blue: "#0000FF",
  blueviolet: "#8A2BE2",
  brown: "#A52A2A",
  burlywood: "#DEB887",
  cadetblue: "#5F9EA0",
  chartreuse: "#7FFF00",
  chocolate: "#D2691E",
  coral: "#FF7F50",
  cornflowerblue: "#6495ED",
  cornsilk: "#FFF8DC",
  crimson: "#DC143C",
  cyan: "#00FFFF",
  darkblue: "#00008B",
  darkcyan: "#008B8B",
  darkgoldenrod: "#B8860B",
  darkgray: "#A9A9A9",
  darkgreen: "#006400",
  darkgrey: "#A9A9A9",
  darkkhaki: "#BDB76B",
  darkmagenta: "#8B008B",
  darkolivegreen: "#556B2F",
  darkorange: "#FF8C00",
  darkorchid: "#9932CC",
  darkred: "#8B0000",
  darksalmon: "#E9967A",
  darkseagreen: "#8FBC8F",
  darkslateblue: "#483D8B",
  darkslategray: "#2F4F4F",
  darkslategrey: "#2F4F4F",
  darkturquoise: "#00CED1",
  darkviolet: "#9400D3",
  deeppink: "#FF1493",
  deepskyblue: "#00BFFF",
  dimgray: "#696969",
  dimgrey: "#696969",
  dodgerblue: "#1E90FF",
  firebrick: "#B22222",
  floralwhite: "#FFFAF0",
  forestgreen: "#228B22",
  fuchsia: "#FF00FF",
  gainsboro: "#DCDCDC",
  ghostwhite: "#F8F8FF",
  gold: "#FFD700",
  goldenrod: "#DAA520",
  gray: "#808080",
  green: "#008000",
  greenyellow: "#ADFF2F",
  grey: "#808080",
  honeydew: "#F0FFF0",
  hotpink: "#FF69B4",
  indianred: "#CD5C5C",
  indigo: "#4B0082",
  ivory: "#FFFFF0",
  khaki: "#F0E68C",
  lavender: "#E6E6FA",
  lavenderblush: "#FFF0F5",
  lawngreen: "#7CFC00",
  lemonchiffon: "#FFFACD",
  lightblue: "#ADD8E6",
  lightcoral: "#F08080",
  lightcyan: "#E0FFFF",
  lightgoldenrodyellow: "#FAFAD2",
  lightgray: "#D3D3D3",
  lightgreen: "#90EE90",
  lightgrey: "#D3D3D3",
  lightpink: "#FFB6C1",
  lightsalmon: "#FFA07A",
  lightseagreen: "#20B2AA",
  lightskyblue: "#87CEFA",
  lightslategray: "#778899",
  lightslategrey: "#778899",
  lightsteelblue: "#B0C4DE",
  lightyellow: "#FFFFE0",
  lime: "#00FF00",
  limegreen: "#32CD32",
  linen: "#FAF0E6",
  magenta: "#FF00FF",
  maroon: "#800000",
  mediumaquamarine: "#66CDAA",
  mediumblue: "#0000CD",
  mediumorchid: "#BA55D3",
  mediumpurple: "#9370DB",
  mediumseagreen: "#3CB371",
  mediumslateblue: "#7B68EE",
  mediumspringgreen: "#00FA9A",
  mediumturquoise: "#48D1CC",
  mediumvioletred: "#C71585",
  midnightblue: "#191970",
  mintcream: "#F5FFFA",
  mistyrose: "#FFE4E1",
  moccasin: "#FFE4B5",
  navajowhite: "#FFDEAD",
  navy: "#000080",
  oldlace: "#FDF5E6",
  olive: "#808000",
  olivedrab: "#6B8E23",
  orange: "#FFA500",
  orangered: "#FF4500",
  orchid: "#DA70D6",
  palegoldenrod: "#EEE8AA",
  palegreen: "#98FB98",
  paleturquoise: "#AFEEEE",
  palevioletred: "#DB7093",
  papayawhip: "#FFEFD5",
  peachpuff: "#FFDAB9",
  peru: "#CD853F",
  pink: "#FFC0CB",
  plum: "#DDA0DD",
  powderblue: "#B0E0E6",
  purple: "#800080",
  rebeccapurple: "#663399",
  red: "#FF0000",
  rosybrown: "#BC8F8F",
  royalblue: "#4169E1",
  saddlebrown: "#8B4513",
  salmon: "#FA8072",
  sandybrown: "#F4A460",
  seagreen: "#2E8B57",
  seashell: "#FFF5EE",
  sienna: "#A0522D",
  silver: "#C0C0C0",
  skyblue: "#87CEEB",
  slateblue: "#6A5ACD",
  slategray: "#708090",
  slategrey: "#708090",
  snow: "#FFFAFA",
  springgreen: "#00FF7F",
  steelblue: "#4682B4",
  tan: "#D2B48C",
  teal: "#008080",
  thistle: "#D8BFD8",
  tomato: "#FF6347",
  turquoise: "#40E0D0",
  violet: "#EE82EE",
  wheat: "#F5DEB3",
  white: "#FFFFFF",
  whitesmoke: "#F5F5F5",
  yellow: "#FFFF00",
  yellowgreen: "#9ACD32"
};

let handler = async (m, { q, conn, args, setReply, prefix, command }) => {
  const isImage = m.type === "imageMessage";
  const isQuotedImage = m.type === "extendedTextMessage" && m.content.includes("imageMessage");
  const isQuotedSticker = m.type === "extendedTextMessage" && m.content.includes("stickerMessage");
  const quoted = m.quoted ? m.quoted : m.msg === undefined ? m : m.msg;

  // Jika tidak ada quoted dan juga tidak ada teks, beri tahu pengguna
  if (!isImage && !isQuotedImage && !isQuotedSticker && !q) {
    return m.reply(`Gunakan perintah ini seperti ini: \n${prefix}${command} <warna> <teks> \nContoh: ${prefix}${command} black hai`);
  }

  m.reply(mess.wait);
  const dia = (m.quoted?.text ? m.quoted : m).sender;
  const name = await conn.getName(dia);
  
  // Memisahkan warna dan teks
  const argsArray = args || [];
  let color = colorCodes[argsArray[0]?.toLowerCase()] || "#FFFFFF"; // Default ke putih jika tidak ada warna yang cocok
  let teks = color !== "#FFFFFF" ? argsArray.slice(1).join(" ") : argsArray.join(" "); // Hanya ambil teks setelah warna jika ada warna

  const avatar = await conn.profilePictureUrl(dia, "image").catch(_ => "https://telegra.ph/file/89c1638d9620584e6e140.png");

  if (isImage || isQuotedImage) {
    let media = await conn.downloadAndSaveMediaMessage(quoted, makeid(5));
    let anu = await TelegraPh(media);
    const json = {
      type: "quote",
      format: "png",
      backgroundColor: color,
      width: 512,
      height: 768,
      scale: 2,
      messages: [{
        entities: [],
        media: { url: anu },
        avatar: true,
        from: {
          id: [0, 4, 5, 3, 2, 7, 5, 9, 8, 1, 6, 10, 9, 7, 5, 3, 1, 2, 4, 6, 8, 0, 10].getRandom(),
          name,
          photo: { url: avatar }
        },
        text: `${teks}`,
        replyMessage: {}
      }]
    };
    const { data } = await axios.post("https://bot.lyo.su/quote/generate", json, {
      headers: { "Content-Type": "application/json" }
    }).catch(e => e.response || {});
    
    if (!data.ok) throw data;
    const buffer = Buffer.from(data.result.image, "base64");
    conn.toSticker(m.chat, buffer, m);
    fs.unlinkSync(media);
  } else if (isQuotedSticker) {
    let media = await conn.downloadAndSaveMediaMessage(quoted, makeid(5));
    let ran = getRandomFile('.png');
    
    exec(`ffmpeg -i ${media} ${ran}`, async (err) => {
      fs.unlinkSync(media);
      if (err) return setReply(err);
      let anuah = await TelegraPh(ran);
      const json = {
        type: "quote",
        format: "png",
        backgroundColor: color,
        width: 512,
        height: 768,
        scale: 2,
        messages: [{
          entities: [],
          media: { url: anuah },
          avatar: true,
          from: {
            id: [0, 4, 5, 3, 2, 7, 5, 9, 8, 1, 6, 10, 9, 7, 5, 3, 1, 2, 4, 6, 8, 0, 10].getRandom(),
            name,
            photo: { url: avatar }
          },
          text: `${teks}`,
          replyMessage: {}
        }]
      };
      const { data } = await axios.post("https://bot.lyo.su/quote/generate", json, {
        headers: { "Content-Type": "application/json" }
      }).catch(e => e.response || {});
      
      if (!data.ok) throw data;
      const buffer = Buffer.from(data.result.image, "base64");
      conn.toSticker(m.chat, buffer, m);
      fs.unlinkSync(ran);
    });
  } else {
    const json = {
      type: "quote",
      format: "png",
      backgroundColor: color,
      width: 512,
      height: 768,
      scale: 2,
      messages: [{
        entities: [],
        avatar: true,
        from: {
          id: [0, 4, 5, 3, 2, 7, 5, 9, 8, 1, 6, 10, 9, 7, 5, 3, 1, 2, 4, 6, 8, 0, 10].getRandom(),
          name,
          photo: { url: avatar }
        },
        text: `${teks}`,
        replyMessage: {}
      }]
    };
    const { data } = await axios.post("https://bot.lyo.su/quote/generate", json, {
      headers: { "Content-Type": "application/json" }
    }).catch(e => e.response || {});
    
    if (!data.ok) throw data;
    const buffer = Buffer.from(data.result.image, "base64");
    conn.toSticker(m.chat, buffer, m);
  }
};

handler.help = ["sticker"];
handler.tags = ["tools"];
handler.command = ["qc", "qcstik"];

export default handler;
