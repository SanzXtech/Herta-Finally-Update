import axios from "axios";

let handler = async (m, { conn }) => {

m.reply(wait);

 try {
   let res = await axios.get('https://api.siputzx.my.id/api/r/blue-archive', { responseType: 'arraybuffer' });
   let buffer = Buffer.from(res.data);
   
   await conn.sendMessage(m.chat, { image: buffer, caption: "*ini hasilnya kak >.<*" }, { quoted: m });
 } catch (error) {
   console.error(error);
   m.reply(`An error occurred: ${error.message}`);
 }
};

handler.help = ['bluearchive'];
handler.tags = ['anime'];
handler.command = /^(bluearchive|ba)$/i;
handler.limit = true;

export default handler;
