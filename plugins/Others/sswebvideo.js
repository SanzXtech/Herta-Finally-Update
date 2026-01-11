/* Buat apikey di https://ytapi.hoshiliz.my.id/create-key */
// Tools Screenshot Video

let handler = async (m, {
 conn,
 text,
 usedPrefix,
 command
}) => {
 if (!text) throw `*Contoh:* ${usedPrefix + command} https://www.example.com`;

 try {
 var kianaImut = 'sanz' // isi key nya cok
 var time = 60000 // ini waktu jeda kalo kurang tambahkan aja
 const response = await fetch(`https://ytapi.hoshiliz.my.id/api/tools/ssweb-video`, {
 method: 'POST',
 headers: {
 'Authorization': `Bearer ${kianaImut}`,
 'Content-Type': 'application/json'
 },
 body: JSON.stringify({
 url: text
 })
 });
 const {
 uid
 } = await response.json();

 if (!uid) throw 'Failed to get UID';

 m.reply(`Screenshot is being created with UID: ${uid}. It may take up to 60 seconds.`);

 await new Promise(resolve => setTimeout(resolve, time));

 const statusResponse = await fetch(`https://ytapi.hoshiliz.my.id/api/tools/ssweb-video/status/${uid}`, {
 headers: {
 'Authorization': `Bearer ${kianaImut}`
 }
 });
 const {
 status,
 resultUrl
 } = await statusResponse.json();

 if (status && resultUrl) {
 await conn.sendFile(m.chat, resultUrl, '', 'Here is your screenshot', m)
 } else {
 m.reply("Processing timed out. Please try again later.");
 }

 } catch (error) {
 console.error(error);
 return m.reply("Failed to retrieve screenshot. Please try again.");
 }
};

handler.tags = ['tools'];
handler.help = ['sswebvideo <link>'];
handler.command = /^(sswebvideo)$/i;
handler.limit = true;
handler.register = true;

export default handler;
