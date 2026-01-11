 
import ffmpeg from "fluent-ffmpeg";
import fs from "fs-extra";

let handler = async (m, { q, conn, args, prefix, setReply, command }) => {
  const isImage = m.type === "imageMessage";
  const isQuotedImage = m.type === "extendedTextMessage" && m.content.includes("imageMessage");
  const quoted = m.quoted ? m.quoted : m.msg === undefined ? m : m.msg;
  const isVideo = m.type === "videoMessage";
  const isQuotedVideo = m.type === "extendedTextMessage" && m.content.includes("videoMessage");



  if (isQuotedImage || isImage) {
    setReply(mess.wait);
 
    let media = await conn.downloadAndSaveMediaMessage(quoted, makeid(5));
    let ran = getRandomFile(".jpeg");

    const sharp = require('sharp');
    const path = require('path');
    
   
    
    sharp(media)
      .metadata()
      .then(metadata => {
        m.reply(`Resolusi gambar: ${metadata.width} x ${metadata.height}`);
      })
      .catch(err => {
        m.reply('Gagal membaca metadata:');
        console.error('Gagal membaca metadata:', err.message);
      });
    

  } else  if (isQuotedVideo || isVideo){

    const ffmpeg = require('fluent-ffmpeg');
    const path = require('path');
    
    let media = await conn.downloadAndSaveMediaMessage(quoted, makeid(5));
    
    ffmpeg.ffprobe(media, (err, metadata) => {
      if (err) {
        m.reply('Gagal membaca metadata')
        return console.error('Gagal membaca metadata:', err.message);
      }
    
      const videoStream = metadata.streams.find(s => s.codec_type === 'video');
    
      if (videoStream) {
m.reply(`Resolusi: ${videoStream.width} x ${videoStream.height}
Durasi: ${metadata.format.duration} detik`);
         
      } else {
        m.reply('Stream video tidak ditemukan.');
        console.log('Stream video tidak ditemukan.');
      }
    });
    



  } else {
    setReply("Reply Image/vidionya");
  }
};

handler.help = ["tools"];
handler.tags = ["tools"];
handler.command = ["cekreso","cekresolution",'cekresoimg'];

export default handler;
