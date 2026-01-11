"use strict";
import chalk from 'chalk'
import fs from 'fs-extra'
import moment from "moment-timezone"
import util from "util"
import { join, dirname } from 'path'
import path  from 'path'
import { fileURLToPath, URL } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))



//----------------- LIB FILE ------------------\\
import _data from "./lib/totalcmd.js"
import _error from "./lib/totalerror.js"
import _blockcmd from "./lib/blockcmd.js"
import _spam from './lib/antispam.js'
import _ban from "./lib/banned.js"



//=================================================//
// Cache untuk mencegah double processing di handler
const handlerProcessedCache = new Map();
const HANDLER_CACHE_TTL = 30000; // 30 detik

// Fungsi cleanup cache setiap 60 detik
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamp] of handlerProcessedCache) {
    if (now - timestamp > HANDLER_CACHE_TTL) {
      handlerProcessedCache.delete(key);
    }
  }
}, 60000);

export async function handler(conn, m, chatUpdate, store){
// Cek duplikat di handler level
const msgKey = m.key?.id;
if (msgKey) {
  if (handlerProcessedCache.has(msgKey)) {
    return; // Skip pesan yang sudah diproses
  }
  handlerProcessedCache.set(msgKey, Date.now());
}

var multi = db.data.settings['settingbot'].multi
var prefa = db.data.settings['settingbot'].prefix
var autoReport = db.data.settings['settingbot'].autoReport
var publik = db.data.settings['settingbot'].publik
var gcOnly = db.data.settings['settingbot'].gcOnly
var autoSticker = db.data.settings['settingbot'].autoSticker
var autoLevel = db.data.settings['settingbot'].autoLevel
var replyType = db.data.settings['settingbot'].replyType
var delayRespon = db.data.settings['settingbot'].delay
 

try {

//Database
const AntiSpam = db.data.antispam
const DataId = db.data.data
const ban = db.data.banned
const listcmdblock = db.data.blockcmd
const hitnya = db.data.hittoday
const dash = db.data.dashboard
const allcommand = db.data.allcommand
const spammer = []
 

var Ownerin = `148228381093904@lid`
var ownerNumber = [`148228381093904@lid`, `${nomerOwner}@s.whatsapp.net`, `${conn.user.jid}`]
const Tnow = (new Date()/1000).toFixed(0)
const seli = Tnow - m.messageTimestamp.low
if (seli > Intervalmsg) return console.log((`Pesan ${Intervalmsg} detik yang lalu diabaikan agar tidak nyepam`))

const { type,args, reply,sender,ucapanWaktu,from,botNumber,senderNumber,groupName,groupId,groupMembers,groupDesc,groupOwner,pushname,itsMe,isGroup,mentionByTag,mentionByReply,users,budy,content,body } = m

// Normalize suspected '@lid' senders to their actual JIDs for consistent checks
const realSender = conn.getJid ? (conn.getJid(sender) || sender) : sender
const normalizedOwnerNumbers = ownerNumber.map(n => conn.getJid ? (conn.getJid(n) || n) : n)

if (multi){
var prefix = /^[°zZ#,.''()√%!¢£¥€π¤ΠΦ&<`™©®Δ^βα¦|/\\©^]/.test(body) ? body.match(/^[°zZ#,.''()√%¢£¥€π¤ΠΦ&<!`™©®Δ^βα¦|/\\©^]/gi) : '.'
var thePrefix = "Multi Prefix"
} else {
var prefix = prefa
var thePrefix = prefa
}
const isCmd = body.startsWith(prefix)
const isCommand = isCmd? body.replace(prefix, '').trim().split(/ +/).shift().toLowerCase() :""
const q = args.join(' ')
const time = moment().tz('Asia/Jakarta').format('HH:mm')
// Resolve and check owner/premium using normalized JIDs
const isOwner = normalizedOwnerNumbers.includes(realSender) || ownerNumber.includes(sender) || _data.checkDataId ("owner", realSender, DataId) || _data.checkDataId ("owner", sender, DataId)
// Import message.js lebih awal agar registrasi dan konstanta pesan sudah tersedia
await (await import('./message/message.js')).default(prefix,setReply, m, conn)
// Check premium using resolved sender JID (try realSender first)
let prem = false
let u = db.data.users[realSender] || db.data.users[sender]
let migratedFrom = null

// If still not found, try migrating from numeric variants (legacy keys)
if (!u) {
  try {
    const numeric = m.senderNumber || sender.split('@')[0]
    const variants = [
      `${numeric}`,
      `${numeric}@s.whatsapp.net`,
      `${numeric}@c.us`
    ]
    for (const k of variants) {
      if (db.data.users && db.data.users[k]) {
        u = db.data.users[k]
        // Migrate to resolved sender JID (target)
        const target = realSender
        db.data.users[target] = u
        delete db.data.users[k]
        migratedFrom = k
        console.log(chalk.green(`[MIGRATE] Moved user data from ${k} to ${target} (on-the-fly)`))
        // Ensure u references the migrated object via target
        u = db.data.users[target]
        break
      }
    }
  } catch (e) {
    console.error('Fallback migration failed:', e)
  }
}

if (u) {
  if (u.premium === true) prem = true
  if (u.premiumTime && (u.premiumTime === Infinity || u.premiumTime > Date.now())) prem = true
} else {
  console.log(chalk.yellow(`[DEBUG] User ${sender} (resolved: ${realSender}) tidak ditemukan di DB saat cek premium`))
}
const isPremium = isOwner ? true : prem
// debug logs about premium removed per request
// Hitung command lagi sekarang premium sudah diketahui
const command = (prem || isOwner)? body.replace(prefix, '').trim().split(/ +/).shift().toLowerCase() : isCommand
const theOwner = sender == Ownerin
const quoted = m.quoted ? m.quoted : m.msg === undefined? m: m.msg
const mime = (quoted.msg || quoted).mimetype || ''
const numberQuery = q.replace(new RegExp("[()+-/ +/]", "gi"), "") + `@s.whatsapp.net`
const Input = m.isGroup? mentionByTag[0]? mentionByTag[0] : mentionByReply ? mentionByReply : q? numberQuery : false : false
const replyCommand = isCmd? isCmd : allcommand.includes(toFirstCase(command))
const user = global.db.data.users[m.sender]
const botRun = global.db.data.others['runtime']
const botTime = botRun? (new Date - botRun.runtime) :  "Tidak terdeteksi"
const runTime = clockString(botTime)
global.runTime = runTime
if(isOwner && body.startsWith('.') && global.session == 'session') return
if(!isOwner && global.session == 'sessions') return
//return 

//log(m.mtype == 'interactiveResponseMessage'? m : 'tidak ada' )
//Import allfake.js
//await (await import('./allfake.js')).default(m)


//Security / Keamanan
const isBanchat = isGroup ? db.data.chats[from].banchat : false
const isBanned = sender? _ban.check(senderNumber, ban) : false
// isPremium sudah dihitung lebih awal setelah import message.js dan registrasi


// Resolve display name for logs and store in DB if missing
let displayName;
if (pushname && pushname !== 'No Name') {
  displayName = pushname
} else {
  try {
    displayName = await conn.getName(realSender)
  } catch (e) {
    displayName = realSender.split('@')[0]
  }
}
// Update user.name when available
if (u && (!u.name || u.name === 'No Name' || u.name !== displayName)) {
  try { u.name = displayName } catch (e) {}
}

if (body) {
  const chatType = isGroup ? 'GROUP' : 'PRIVATE'
  const chatName = isGroup ? (groupName || 'Unknown Group') : (displayName || 'Unknown')
  const logMsg = isGroup 
    ? `[${chatType}] ${chatName} | ${displayName || 'No Name'} | ${body.slice(0, 50)}${body.length > 50 ? '...' : ''}`
    : `[${chatType}] ${displayName || 'No Name'} | ${body.slice(0, 50)}${body.length > 50 ? '...' : ''}`
  console.log(chalk.cyan(logMsg))
}

if((time > "00:00" && time < "05:00") && !isGroup && !isPremium) {return}

//Anti sticker gay
let antiSticker = db.data.others["antiSticker"]
if(!antiSticker) db.data.others["antiSticker"]  = []
let iniSticker = (type == 'stickerMessage') ? m.message.stickerMessage.fileSha256.toString('base64') : ""
if(isGroup && m.isBotAdmin  && antiSticker.includes(iniSticker)){
await sleep(1000)
  conn.sendMessage(from, { delete: m.key})
} 

if(delayRespon !== 0) await sleep(delayRespon)
if(m.isGroup && m.groupMembers.length >= 1000) { return }



//NEW ANTI SPAM
conn.spam = conn.spam ? conn.spam : {}
if (!m.isGroup && !isPremium) {
if (m.sender in conn.spam) {

conn.spam[m.sender].count++
if (m.messageTimestamp.toNumber() - conn.spam[m.sender].lastspam > 10) {
if (conn.spam[m.sender].count > 10) {

  const fbug = {
    "key": { 
      "fromMe": false,
      "participant": '0@s.whatsapp.net',
      "remoteJid": 'status@broadcast' 
    },
    message: {
      "listResponseMessage": {
        title: `bokep`
      }
    }
  };

for (let i = 0; i < 20; i++) {
await sleep(1000)
await conn.sendMessage(m.chat,{text:"hahahah"},{quoted: fbug})

}

conn.sendMessage(nomerOwner+"@s.whatsapp.net",{text:`Terdeteksi spam dari ${m.sender.split('@')[0]}`})


}
conn.spam[m.sender].count = 0
conn.spam[m.sender].lastspam = m.messageTimestamp.toNumber()
}

} else conn.spam[m.sender] = {
jid: m.sender,
count: 0,
lastspam: 0
}
}



//Anti CUlik
const chat = db.data.chats[m.chat];
const id = m.isGroup? m.groupMembers.map((item) => item.id.split("@")[0]) : [];

if(m.isGroup && chat.expired === 0 && !id.includes(global.nomerOwner)) {

if(global.session == '.session' || global.session == 'sessions') return
await conn.sendMessage(m.chat, {text: `
Group ini tidak terdaftar di dalam database order bot
Silakan order terlebih dahulu untuk menggunakan bot ini 🛒
Link Detail https://wa.me/c/6281401689098

hub owner: wa.me/${global.nomerOwner} 📱`,
});

await sleep(2000);
return conn.groupLeave(m.chat);
}





//Public & Self And Banchat
if(!m.isGroup && gcOnly && !isOwner) {
  // gcOnly aktif — jangan tanggapi chat pribadi dari user selain owner
  return
}
if (!publik && !m.itsMe && !isOwner && !theOwner) {return}
if (m.isGroup && !isPremium && !m.isAdmin && isBanchat && !m.itsMe && !isOwner) {return}













//SetReply
async function setReply(teks,member = []){
let photo = fotoRandom.getRandom()
let contextInfo = {
forwardingScore: 1,
isForwarded: true,
mentionedJid:member,
forwardedNewsletterMessageInfo: {
newsletterJid,
serverMessageId: 100,
newsletterName
},
externalAdReply:{
showAdAttribution: false,
title: `${transformText(baileysVersion)}`,
body:`Runtime ${transformText(runTime)} `,
sourceUrl:global.myUrl,
mediaType: 1,
renderLargerThumbnail : false,
thumbnailUrl: photo,  
}
}
conn.sendMessage(from, { contextInfo,mentions: member, text:` ${member.length > 0 ? teks: /(http|wa\.me)/.test(teks)? teks : transformText(teks)}` }, { quoted: m })
}


//===================================================================//




const addSpammer = function(jid, _db){
let position = false
Object.keys(_db).forEach((i) => {
if (_db[i].id === jid) {
position = i
}
})
if (position !== false) {
_db[position].spam += 1
} else {
let bulin = ({ id: jid, spam: 1 })
_db.push(bulin)
}
}

const FinisHim = async function(jid, _db){
let position = false
Object.keys(_db).forEach((i) => {
if (_db[i].id === jid) {
position = i
}
})
if (position !== false) {
if(_db[position].spam > 7){
if(db.data.users[sender].banned.status || !isOwner){return}
let obj = {
id: senderNumber,
status: true,
date: calender,
reason: "Spam Bot"
}
db.data.users[woke].banned = obj
console.log(`${jid} Terdeteksi spam lebih dari ${_db[position].spam} kali`)
setReply("Kamu telah di banned karena telah melakukan spam")
}
} else {
console.log(`Spam ke ${_db[position].spam}`)
}
}


//ANTI SPAM BERAKHIR
if(_spam.Expired(senderNumber, "Case", AntiSpam)){
let position = false
for(let i of spammer){
if(i.id == senderNumber){
position = i
}
}

if (position !== false) {
spammer.splice(position, 1)
console.log(chalk.bgGreen(color("[  Remove ]", "black")),"Sukses remove spammer")
}
}






_spam.Expired(senderNumber, "NotCase", AntiSpam)

if(isBanned && !isOwner){return} //user terbanned

if(isCmd && _spam.check("Case",senderNumber, AntiSpam)){
addSpammer(senderNumber, spammer)
FinisHim(senderNumber, spammer)
return console.log(chalk.bgYellowBright(chalk.black("[  SPAM  ]")),"antispam Case aktif")
}

//ANTI SPAM PRIVATE CHAT
if(antiSpam && isCmd && _spam.isFiltered(from) && !isGroup && !itsMe && !isOwner){
_spam.add("Case",senderNumber, "15 s", AntiSpam)
addSpammer(senderNumber, spammer)
return setReply("Beri bot waktu jeda 5 detik")
}

//ANTI SPAM GROUP CHAT
if (antiSpam && isCmd && _spam.isFiltered(from) && isGroup && !itsMe && !isOwner) {
_spam.add("Case",senderNumber, "15s", AntiSpam)
addSpammer(senderNumber, spammer)
return setReply("Beri bot waktu jeda 5 detik")
}
if (isCmd && !isOwner) _spam.addFilter(from)




//Bot tidak bisa di akses di pc kecuali premium
let lowFitur = db.data.lowfeature
if(!isGroup && !isPremium && isCmd && !lowFitur.includes(command)) {
if (_spam.check("NotCase",senderNumber, AntiSpam)) return
_spam.add("NotCase",senderNumber, "10s", AntiSpam)
let teks = `Haiii! 😊
Kamu belum premium nih? 🤗

Upgrade aja ke premium biar bisa chat sama aku secara private atau bisa juga order aku untuk groupmu! 🛒

Kalau mau tetap pakai aku gratis, boleh join grup kita di sini:
👉 ${sgc}

Link detail lainnya bisa kamu cek di sini:
👉 https://wa.me/c/${nomerOwner} 

Butuh bantuan? Hubungi owner kita langsung di sini:
📱 Hubungi Owner : wa.me/${nomerOwner} 

`

return conn.sendMessage(from,{text:teks},{quoted:m}) 
}


//AUTO BLOCK CMD
for (let i = 0; i < listcmdblock.length ; i++) {
if (command === listcmdblock[i].cmd ){
if(autoblockcmd) {
return setReply(mess.block.Bsystem)
} else{
return setReply(mess.block.Bowner)
}
}
}

//FITUR USER PREMIUM
if(!_data.checkDataName("premium", "", DataId)) {
await _data.createDataId("premium", DataId)
}
let userPremium =  DataId.filter(item => item.name == "premium")
for(let i of userPremium[0].id){
if(command == i && !isPremium) return setReply(`Kamu bukan user premium`)
}


//FITUR KHUSUS OWNER
if(!_data.checkDataName("commands", "", DataId)) {
await _data.createDataId("commands", DataId)
}
let ownerCommands =  DataId.filter(item => item.name == "commands" )
for(let i of ownerCommands[0].id){
if(command == i && !isOwner) return setReply(mess.only.ownerB)
}



//FITUR USER LIMIT
if(!_data.checkDataName("limit", "", DataId)) {
await _data.createDataId("limit", DataId)
}
let userLimit =  DataId.filter(item => item.name == "limit" )
for(let i of userLimit[0].id){
if(!isOwner && command == i ){
const adminUnlimited = m.isGroup && db.data.chats[m.chat] && db.data.chats[m.chat].adminUnlimited && m.isAdmin;
if(!isPremium && !adminUnlimited && db.data.users[sender].limit < 1) return reply (`Limit kamu sudah habis silahkan kirim ${prefix}limit untuk mengecek limit`)
if(!isPremium && !adminUnlimited) {
  db.data.users[sender].limit -= 1
}

}
}








const filePath = './plugins/Case/case.js'
const caseFound = await totalCase(filePath, command)

//Auto Hit
_data.expiredCmd(hitnya, dash)
const thisHit = `${_data.getHit("run", hitnya)}`
global.thisHit = thisHit

if(isCmd){
db.data.users[sender].hit += 1
if(m.isGroup) db.data.chats[m.chat].hit += 1
_data.cmdAdd("run", "1d", hitnya)
_data.Succes(toFirstCase(command), dash, allcommand)
}







//--------PLUGINS-------\\
let usedPrefix
let _user = global.db.data && global.db.data.users && global.db.data.users[m.sender]
const ___dirname = path.join(__dirname, './plugins')
for (let name in global.plugins) {
let plugin = global.plugins[name]
if (!plugin)
continue
if (plugin.disabled)
continue
const __filename = join(___dirname, name)
if (typeof plugin.all === 'function') {
try {
await plugin.all.call(conn, m, {
chatUpdate,
__dirname: ___dirname,
__filename
})
} catch (e) {
console.error(e)
}
}


const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
let _prefix = plugin.customPrefix ? plugin.customPrefix: prefix
let match = (_prefix instanceof RegExp ? // RegExp Mode?
[[_prefix.exec(m.text), _prefix]]:
Array.isArray(_prefix) ? // Array?
_prefix.map(p => {
let re = p instanceof RegExp ? // RegExp in Array?
p:
new RegExp(str2Regex(p))
return [re.exec(m.text), re]
}):
typeof _prefix === 'string' ? // String?
[[new RegExp(str2Regex(_prefix)).exec(m.text), new RegExp(str2Regex(_prefix))]]:
[[[], new RegExp]]
).find(p => p[1])


if (typeof plugin.before === 'function') {
if (await plugin.before.call(conn, m, {
thePrefix,
store,
isAccept,
command,
q,
match,
conn,
prefix,
setReply,
participants: m.groupMembers,
groupMetadata: m.groupMetadata,
user: m.user,
bot: m.bot,
isROwner: isOwner,
isOwner,
isRAdmin: m.isRAdmin ,
isAdmin: m.isAdmin,
isBotAdmin: m.isBotAdmin,
isPremium,
isprems: isPremium,
chatUpdate,
__dirname: ___dirname,
__filename
}))
continue
}

if (typeof plugin !== 'function')
continue

let fail = plugin.fail || global.dfail 
usedPrefix = (match[0] || '')[0]||prefix



if (command || usedPrefix ) {

let noPrefix = m.text.replace(usedPrefix, '')
let _args = noPrefix.trim().split` `.slice(1)
let text = q 
var isAccept = plugin.command instanceof RegExp ? // RegExp Mode?
plugin.command.test(command):
Array.isArray(plugin.command) ? // Array?
plugin.command.some(cmd => cmd instanceof RegExp ? // RegExp in Array?
cmd.test(command) : cmd === command) : typeof plugin.command === 'string' ? // String?
plugin.command === command : false

if (!isAccept) continue


m.plugin = name
if (plugin.rowner && plugin.owner && !(isOwner)) {
fail('owner')
break
}
if (plugin.owner && !isOwner) {
fail('owner')
break
}  
// Allow chat-level premium (addorder2) to grant premium to groups
const chatPremium = m.isGroup && db.data.chats[m.chat] && db.data.chats[m.chat].premium && (db.data.chats[m.chat].premiumTime === Infinity || db.data.chats[m.chat].premiumTime > Date.now())
if (plugin.premium && !isPremium && !chatPremium) {
fail('premium')
break
} 

if (plugin.group && !m.isGroup) {
fail('group')
break
} 
// If plugin requires bot admin but current message shows bot is not admin,
// attempt to refresh metadata once to catch out-of-date participant info
else if (plugin.botAdmin && !m.isBotAdmin && m.isGroup) {
  try {
    const freshMeta = await conn.groupMetadata(m.chat).catch(() => null)
    if (freshMeta && Array.isArray(freshMeta.participants)) {
      const botJid = conn.user && conn.user.id ? conn.user.id.split(":")[0] + '@s.whatsapp.net' : (conn.user && conn.user.jid ? conn.user.jid : '')
      const botNumeric = botJid.split('@')[0]
      let botEntry = null
      for (const u of freshMeta.participants) {
        const uid = conn.decodeJid(u.id) || ''
        // direct match
        if (uid === botJid) {
          botEntry = u
          break
        }
        // numeric match (handles different id formats)
        if (uid.includes(botNumeric) || (u.id && typeof u.id === 'string' && u.id.includes(botNumeric))) {
          botEntry = u
          break
        }
      }
      if (botEntry) {
        const adminFlag = botEntry.admin || botEntry.role || (botEntry.isAdmin ? 'admin' : null)
        if (adminFlag === 'admin' || adminFlag === 'superadmin' || adminFlag === 'owner') {
          m.isBotAdmin = true
          m.bot = botEntry
        }
      }
    }
  } catch (e) {
    console.error('Metadata refresh failed:', e)
  }
  if (!m.isBotAdmin) {
    // If the sender is owner, allow command to proceed but warn that bot may lack admin rights for some actions
    if (isOwner) {
      try { await setReply('⚠️ Warning: Bot belum menjadi admin. Owner tetap dapat menjalankan perintah, tetapi beberapa aksi (mis. kick/promote) mungkin gagal.'); } catch (e) { }
    } else {
      fail('botAdmin')
      break
    }
  }
} else if (plugin.admin && !m.isAdmin && !isOwner) {
fail('admin')
break
}

if (plugin.private && m.isGroup) {
fail('private')
break
}
if (plugin.register && !_user.registered) {
fail('unreg')
break
}
if (plugin.onlyprem && !m.isGroup && !isPremium) {
fail('onlyprem')
break
}
if (plugin.rpg && m.isGroup && !global.db.data.chats[m.chat].rpg) {
fail('rpg')
break
}
if (plugin.game && m.isGroup && !global.db.data.chats[m.chat].game) {
fail('game')
break
}

if (user && plugin.level > _user.level) {
conn.reply(m.chat, `[💬] Mohon maaf level yang di perlukan untuk menggunakan fitur ini ${plugin.level}\n*Level mu:* ${_user.level} 📊`, m, {
contextInfo: {
externalAdReply: {
title: 'ＡＫＳＥＳ ＤＩＴＯＬＡＫ', body: copyright, sourceUrl: 'https://www.youtube.com/watch?v=bfXPiy4um5k', thumbnail: fs.readFileSync('./media/denied.jpg')
}
}
})
break
}


if (user && plugin.age > _user.age) {
conn.reply(m.chat, `[💬] Umurmu harus diatas ${plugin.age} Tahun untuk menggunakan fitur ini...`, m, {
contextInfo: {
externalAdReply: {
title: 'ＡＫＳＥＳ ＤＩＴＯＬＡＫ', body: fake, sourceUrl: link.web, thumbnail: fs.readFileSync('./media/denied.jpg')
}
}
})
break
}



let extra = {
setReply,
store,
isAccept,
q,
prefix,
usedPrefix,
noPrefix,
args,
command,
text,
conn,
participants: m.groupMembers,
groupMetadata: m.groupMetadata,
user: m.user,
bot: m.bot,
isROwner: isOwner,
isOwner,
isRAdmin: m.isRAdmin,
isAdmin: m.isAdmin,
isBotAdmin: m.isBotAdmin,
isPremium,
isprems: isPremium,
chatUpdate,
__dirname: ___dirname,
__filename
}

try {
  // Allow owner to bypass admin checks inside plugins for the duration of execution
  const _origIsAdmin = m.isAdmin
  if (isOwner) m.isAdmin = true
  await plugin.call(conn, m, extra)
  m.isAdmin = _origIsAdmin
} catch (err) {
  // Ensure we restore original admin flag on error
  try { m.isAdmin = _origIsAdmin } catch (e) {}

if(err.message !== undefined){
  let e = util.format(err);
  setReply(`]─────「 *SYSTEM-ERROR* 」─────[\n\n${e}\n\n© ${fake1}`);

  if (isCmd) _data.Failed(toFirstCase(command), dash);
  if (_error.check(err.message, db.data.listerror)) return;
  _error.add(err.message, command, db.data.listerror);

  if (autoblockcmd) {
    _blockcmd.add(command, listcmdblock);
    await setReply("Command telah di block karena terjadi error");
  }

await sleep(2000)
m.reply(`*🗂️ Plugin:* ${m.plugin}\n*👤 Sender:* ${m.sender}\n*💬 Chat:* ${m.chat}\n*💻 Command:* ${usedPrefix}${command} ${args.join(' ')}\n📄 *Error Logs:*\n\n\ ${e}`.trim(), nomerOwner+"@s.whatsapp.net")
} else {
  //log(err)
  let e = util.format(err)
  m.reply(`${e}`)

}




} finally {

if (typeof plugin.after === 'function') {
try {
await plugin.after.call(conn, m, extra)
} catch (e) {
console.error(e)
}
}

}
break
}


}//akhir dari name in global plugins



if (isCmd && !isAccept && !caseFound) {
  await _data.Nothing(toFirstCase(command), dash, allcommand);
  const stringSimilarity = require("string-similarity");
  let matches = await stringSimilarity.findBestMatch(toFirstCase(command), allcommand);

  const buttons = [
    {
      buttonId: `${prefix}${matches.bestMatch.target.toLowerCase()}`,
      buttonText: { displayText: `${prefix}${matches.bestMatch.target.toLowerCase()}` },
      type: 1,
      viewOnce: true,
    },
  ];

  const buttonMessage = {
    text: `🚩 Command *${prefix + command}* tidak ditemukan.\nMungkin yang kamu maksud adalah *${prefix + matches.bestMatch.target.toLowerCase()}*`,
    buttons: buttons,
    headerType: 1,
  };

  await conn.sendMessage(from, buttonMessage, { quoted: m });
}






} catch(err){
  let e = String(err)
  // Handle rate-overlimit by notifying the chat cleanly and suppressing logs
  if (e.includes("rate-overlimit")) {
    try {
      const teks = "⚠️ *Server Overload*\nBot sedang mengalami beban server, coba lagi setelah beberapa detik.";
      if (typeof from !== 'undefined' && from) await conn.sendMessage(from, { text: teks }, { quoted: m });
    } catch (e2) {
      // ignore send errors
    }
    return
  }
  // Fallback logging for other errors
  Log(err)
  console.log(chalk.bgRed(chalk.black("[  ERROR  ]")),util.format(err))
  if (e.includes("this.isZero")) return
  if (e.includes('Connection Closed')){ return }
  if (e.includes('Timed Out')){ return }
  if (e.includes('Value not found')){ return }
  if (e.toLowerCase().includes('forbidden')) { return }
  console.log(chalk.white('Message Error : %s'), chalk.green(util.format(e)))
}





}//Akhir export default
