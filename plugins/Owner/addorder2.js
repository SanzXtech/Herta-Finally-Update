import toMs from "ms";
import ms from "parse-ms"
import moment from "moment-timezone"
import _data from "../../lib/totalcmd.js"

let handler = async (m, { conn, q, args, setReply, usedPrefix, command, isOwner }) => {
  let timeWib = moment().tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm');
const DataId = db.data.data
if (!isOwner && !_data.checkDataId("reseller", m.sender, DataId)) return setReply(mess.only.ownerB)

if(!m.isGroup){

const rex1 = /chat.whatsapp.com\/([\w\d]*)/g;
let LinkGc = q.includes("|")? q.split("|")[0] : q.split(" ")[0]
let Second = q.includes("|")? q.split("|")[1] : q.split(" ")[1]
let code = LinkGc.match(rex1);
if (code == null) return  setReply("No invite url detected.");
let kode = code[0].replace("chat.whatsapp.com/", "");

var { id, subject,creation,desc,descId,participants,owner,subjectOwner } = await conn.groupGetInviteInfo(kode).catch(async () => {
return m.reply("Invalid invite url.");
});

let tagnya = owner == undefined?  subjectOwner == undefined? "" : subjectOwner : owner
var creator = `${owner == undefined? subjectOwner == undefined? "Tidak ada" : "@"+ subjectOwner.split("@")[0]: "@"+ owner.split("@")[0]}`

let chat = global.db.data.chats[id];

await addPremium(id, subject, LinkGc, Second)

let teks =`\n––––––『 *ADDORDER2 (GROUP PREMIUM)* 』––––––\n\nGroup: ${subject}\nGroup Id: ${id}\nDays: ${Second}\nTime order: ${timeWib}\nTime end: ${tSewaBerakhir(Date.now() + toMs(Second))}\n\n• Fitur: Member group dapat menggunakan fitur Premium\n• Admin group mendapatkan unlimited limit (seperti user premium)\n\n${copyright} - ${calender}`

await conn.sendMessage(m.chat,{text:teks,mentions:[tagnya]},{quoted:m})

} else if(m.isGroup){
if(!q) return setReply("Masukan angka 1m/1d/1h")
addPremium(m.chat, m.groupName, 'group', q)
m.reply("Berhasil Add Order2 (Group Premium) ke group")
}


// Fungsi untuk menghitung tanggal sewa berakhir
function tSewaBerakhir(tanggalSewa){
  const result = moment(tanggalSewa).tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm');
  return result 
}

// Fungsi untuk menambahkan set premium group
function addPremium(gid, subject, link, expired) {
  let timeWib = moment().tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm');
  let chat = global.db.data.chats[gid];
  if (chat) {
    chat.premium = true;
    chat.premiumTime = Date.now() + toMs(expired);
    chat.adminUnlimited = true;
    chat.timeOrder = `${timeWib}`;
    chat.timeEnd = tSewaBerakhir(Date.now() + toMs(expired));
    chat.linkgc = link;
    chat.name = subject;
  } else {
    global.db.data.chats[gid] = {
      id: gid,
      name: subject,
      linkgc: link,
      premium: true,
      premiumTime: Date.now() + toMs(expired),
      adminUnlimited: true,
      timeOrder: `${timeWib}`,
      timeEnd: tSewaBerakhir(Date.now() + toMs(expired)),
      creator: "Unknown"
    };
  }
}


}

handler.help = ['addorder2 <hari>']
handler.tags = ['owner']
handler.command = /^(addorder2|addordervip|addgroupvip)$/i
handler.group = false
export default handler
