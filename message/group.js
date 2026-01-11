import moment from "moment-timezone";
import chalk from "chalk";
import fs from 'fs-extra'
import util from "util";
import canvafy from "canvafy";
import {
getBuffer,
getGroupAdmins,
} from "../lib/myfunc.js";

//Function update member dengan welcome/leave
export const memberUpdate = async (conn, anu) => {
await sleep(3000)
var jeda = false;
if (jeda) return console.log("spam welcome aktif");
jeda = true;
try {
const { id, participants, action } = anu;
log(anu)

var dataChat = conn.chats[id]

if(action === "demote" && dataChat){
let members = conn.chats[id].metadata.participants //|| (await conn.groupMetadata(id)).participants
await members.forEach(participant => {
if (participant.id === participants[0]) {
participant.admin = null;
}
});// System-style log for demote
try {
  const who = conn.decodeJid(participants[0]) || participants[0];
  const whoName = await conn.getName(who).catch(() => who);
  const groupName = (dataChat && dataChat.metadata && dataChat.metadata.subject) ? dataChat.metadata.subject : id;
  console.log(chalk.bgBlue.black(" SYSTEM "), chalk.magenta.bold('DEMOTE'), `${whoName} (${who}) -> ${groupName}`);
} catch (err) {}
} else if(action === "promote" && dataChat) {
let members = conn.chats[id].metadata.participants
await members.forEach(participant => {
if (participant.id === participants[0]) {
participant.admin = 'admin'
}
});
// System-style log for promote
try {
  const who = conn.decodeJid(participants[0]) || participants[0];
  const whoName = await conn.getName(who).catch(() => who);
  const groupName = (dataChat && dataChat.metadata && dataChat.metadata.subject) ? dataChat.metadata.subject : id;
  console.log(chalk.bgBlue.black(" SYSTEM "), chalk.blueBright.bold('PROMOTE'), `${whoName} (${who}) -> ${groupName}`);
} catch (err) {}

} else if(action === "add" && dataChat  ) {
let obj = {
id: participants[0],
admin: null
}

let members = conn.chats[id].metadata.participants
members.push(obj)
let bot = members.find(u => conn.decodeJid(u.id) == conn.user.jid)
let isBotAdmin = !!(bot && (bot.admin === 'admin' || bot.admin === 'superadmin'))

let sender = conn.decodeJid(anu.participants[0])
// System-style log for join
try {
  const senderName = await conn.getName(sender).catch(() => sender);
  const groupName = (dataChat && dataChat.metadata && dataChat.metadata.subject) ? dataChat.metadata.subject : id;
  console.log(chalk.bgGreen.black(" SYSTEM "), chalk.green.bold('JOIN'), `${senderName} (${sender}) -> ${groupName}`);
} catch (err) {}

if(isBotAdmin && participants[0].split('@')[0] === global.nomerOwner){
await conn.groupParticipantsUpdate(id, [sender], "promote")
}
} else if(action === "remove" && dataChat ) {
let members = conn.chats[id].metadata.participants
let idToRemove = participants[0]
members.filter(item => item.id !== idToRemove);
// System-style log for leave
try {
  const who = conn.decodeJid(idToRemove) || idToRemove;
  const whoName = await conn.getName(who).catch(() => who);
  const groupName = (dataChat && dataChat.metadata && dataChat.metadata.subject) ? dataChat.metadata.subject : id;
  console.log(chalk.bgYellow.black(" SYSTEM "), chalk.yellow.bold('LEAVE'), `${whoName} (${who}) -> ${groupName}`);
} catch (err) {}
}

// Handle Welcome/Leave Messages dengan Canvafy
if (action === "add" || action === "remove") {
  await handleWelcomeLeave(conn, anu);
}

const _rawParticipant = anu.participants[0] || '';
const _botId = conn.user && (conn.user.id ? conn.user.id.split(":")[0] : (conn.user && conn.user.jid ? conn.user.jid.split("@")[0] : ''));
// Skip system 'lid' participants unless the event concerns the bot itself
if (_rawParticipant.includes('@lid') && !_rawParticipant.includes(_botId)) {
  return log('log 1')
}
if ((action == "remove" || action == "promote" || action == "demote") &&
anu.participants[0].split("@")[0].includes(conn.user.id.split(":")[0])
)
return log('log 2')
const myGroup = Object.keys(db.data.chats);
const from = anu.id
const botNumber = conn.user.jid;
const groupMetadata = ((conn.chats[from] || {}).metadata || await conn.groupMetadata(from).catch(_ => null))  || {}
const groupName = groupMetadata.subject || [];
const sender = conn.decodeJid(anu.participants[0])
if(sender.includes('_')) { console.log(chalk.bgBlue.black(' SYSTEM '), chalk.cyan('UNDERSCORE'), 'participant id contains underscore, skipping'); return; }
const senderNumber = sender.split("@")[0];
let groupMembers = groupMetadata.participants || [];
// If metadata participants are empty or stale, try to refresh
if ((!groupMembers || groupMembers.length === 0) && m.isGroup) {
  try {
    const fresh = await conn.groupMetadata(from).catch(() => null);
    if (fresh && Array.isArray(fresh.participants) && fresh.participants.length > 0) {
      groupMembers = fresh.participants;
      console.log('Refreshed group metadata for', from, 'participants:', groupMembers.length);
    }
  } catch (e) {
    // ignore
  }
}
const groupAdmins = getGroupAdmins(groupMembers) || [];
const groupDesc = groupMetadata.desc || [];
const groupOwner = groupMetadata.owner || [];
// Normalize participant id lookup (support u.id or u.jid)
const user = groupMembers.find((u) => conn.decodeJid(u.id || u.jid) === sender) || {};
const botJid = conn.user && (conn.user.id ? conn.user.id.split(":")[0] + '@s.whatsapp.net' : (conn.user && conn.user.jid ? conn.user.jid : ''));
const bot = groupMembers.find((u) => conn.decodeJid(u.id || u.jid) === botJid) || {};

const isOwner = sender.split('@')[0] === nomerOwner
const isRAdmin = (user && (user.admin === "superadmin" || user.isSuperAdmin === true)) || false;
const isAdmin = isRAdmin || (user && (user.admin === "admin" || user.isAdmin === true)) || false;
const isBotAdmin = !!(bot && (bot.admin === 'admin' || bot.admin === 'superadmin' || bot.isAdmin === true || bot.isSuperAdmin === true));
if (!isBotAdmin) console.log('Bot not admin according to metadata for group', from, 'botEntry:', bot)
  // If the bot is among changed participants (promote/demote/add/remove), refresh metadata proactively
  try {
    const affected = (participants || []).map(p => conn.decodeJid(p));
    if (affected.includes(botJid)) {
      // Refresh metadata and lid map to ensure admin status and mapping are up-to-date
      const refreshed = await conn.refreshGroupMetadata(from).catch(_ => null) || null
      if (refreshed) {
        try { conn._updateLidMapForGroup(from, refreshed) } catch (e) { console.error(e) }
        // Log if bot became admin
        const refreshedBot = refreshed.participants.find(u => conn.decodeJid(u.id || u.jid) === botJid) || null
        if (refreshedBot) {
          const nowBotAdmin = !!(refreshedBot && (refreshedBot.admin === 'admin' || refreshedBot.admin === 'superadmin' || refreshedBot.isAdmin === true || refreshedBot.isSuperAdmin === true))
          if (nowBotAdmin) console.log('Bot promoted to admin in group', from)
        }
      }
    }
  } catch (e) {
    // ignore refresh errors
  }
const pushname = await conn.getName(sender);
const oneMem = anu.participants.length === 1;
const itsMe = sender === botNumber;
const timeWib = moment.tz("Asia/Jakarta").format("HH:mm");
const chat = global.db.data.chats[id];
const add = action == "add";
const remove = action == "remove";
const isBanchat = myGroup.includes(from) ? db.data.chats[from].banchat : false;

if (isBanchat) {
console.log(chalk.bgYellow.black(' SYSTEM '), chalk.yellow('BANCHAT'), `chat ${from} is banned, skipping`);
return;
} 

let m = {
chat: from,
pushname: pushname,
sender: sender,
};

if (!chat) { console.log(chalk.bgYellow.black(' SYSTEM '), chalk.yellow('NO_CHAT'), `no chat data for ${id}`); return; }


//Auto kick jika itu user yang sudah di tandai
let kickon = db.data.kickon[from];
if (add && kickon && kickon.includes(senderNumber)) {
let teks = `@${senderNumber} tidak di izinkan masuk karena dia telah keluar dari group ini sebelumnya, dan juga sudah di tandai sebagai user biadap`;

await conn.sendMessage(from, { 
text: teks,
mentions: [sender]
});

if (!isBotAdmin)
return conn.sendMessage(from, {
text: `Gagal mengeluarkan @${senderNumber} dari group karena bot bukan admin`,
mentions: [sender]
});
if (isBotAdmin)
return conn.groupParticipantsUpdate(from, [sender], "remove");
}

await sleep(5000);
jeda = false;
} catch (err) {
  jeda = false;
  let e = String(err);
  if (e.includes("this.isZero")) return;
  if (e.includes("rate-overlimit")) return;
  if (e.includes("Connection Closed")) return;
  if (e.includes("Timed Out")) return;
  console.log(err);
  console.log(chalk.white("GROUP :"), chalk.green(e));

  let text =`${util.format(anu)}

${util.format(err)}`
  conn.sendMessage(ownerBot,{text})
}
};

// Function untuk handle welcome dan leave dengan Canvafy
const handleWelcomeLeave = async (conn, anu) => {
try {
const { id, participants, action } = anu;

// Early returns untuk filtering
const _rawParticipant = anu.participants[0] || '';
const _botId = conn.user && (conn.user.id ? conn.user.id.split(":")[0] : (conn.user && conn.user.jid ? conn.user.jid.split("@")[0] : ''));
if(_rawParticipant.includes('@lid') && !_rawParticipant.includes(_botId)) {
  console.log(chalk.bgBlue.black(' SYSTEM '), chalk.cyan('LID_EVENT'), `skipping non-bot system participant: ${_rawParticipant}`);
  return;
} else if(_rawParticipant.includes('@lid') && _rawParticipant.includes(_botId)) {
  console.log(chalk.bgBlue.black(' SYSTEM '), chalk.cyan('LID_EVENT'), 'event for bot itself, continuing')
} 

if ((action == "remove" || action == "promote" || action == "demote") &&
anu.participants[0].split("@")[0].includes(conn.user.id.split(":")[0])
) {
console.log(chalk.bgBlue.black(' SYSTEM '), chalk.cyan('BOT_ACTION'), 'action concerns bot, ignoring');
return;
} 

const myGroup = Object.keys(db.data.chats);
const from = anu.id
const botNumber = conn.user.jid;
const groupMetadata = ((conn.chats[from] || {}).metadata || await conn.groupMetadata(from).catch(_ => null))  || {}
const groupName = groupMetadata.subject || "Unknown Group";
const sender = conn.decodeJid(anu.participants[0])

if(sender.includes('_')) {
console.log('log 3 - underscore detected');
return;
}

const senderNumber = sender.split("@")[0];
const groupMembers = groupMetadata.participants || [];
const groupDesc = groupMetadata.desc || "Tidak ada deskripsi";
const pushname = await conn.getName(sender);
const oneMem = anu.participants.length === 1;
const itsMe = sender === botNumber;
const timeWib = moment.tz("Asia/Jakarta").format("HH:mm");
const chat = global.db.data.chats[id];
const add = action == "add";
const remove = action == "remove";
const isBanchat = myGroup.includes(from) ? db.data.chats[from].banchat : false;

if (isBanchat) {
console.log('log 4 - banchat detected');
return;
}

if (!chat) {
console.log('log 5 - no chat data');
return;
}

if (!chat.welcome) {
console.log(chalk.bgYellow.black(' SYSTEM '), chalk.yellow('WELCOME_DISABLED'), `welcome disabled for ${groupName}`);
return;
}

console.log(chalk.bgGreen.black(' SYSTEM '), chalk.green('WELCOME'), `processing ${action.toUpperCase()} -> ${sender} in ${groupName}`); 

// Get user profile picture
let pp;
try {
pp = await conn.profilePictureUrl(sender, "image");
} catch (err) {
pp = null; // Will use default avatar from local file
}

switch (action) {
case "add": {
if (!chat.welcome || itsMe || !oneMem) return;
// Default welcome message template
let welcomeText = chat.sWelcome || "Welcome @user";
welcomeText = welcomeText
.replace(/@user/g, `@${senderNumber}`)
.replace(/@subject/g, groupName)
.replace(/@desc/g, groupDesc);

// Generate welcome image with Canvafy
let welcomeImage;
try {
  const backgroundPath = "./media/welcomeleave.jpg"; // Local file path
  const avatarPath = "./media/user.jpg"; // Default avatar path

  welcomeImage = await new canvafy.WelcomeLeave()
    .setAvatar(pp || avatarPath) // Use profile picture or default
    .setBackground("image", backgroundPath)
    .setTitle("Welcome")
    .setDescription(`Welcome to ${groupName}`)
    .setBorder("#6200ee")
    .setAvatarBorder("#6200ee")
    .setOverlayOpacity(0.3)
    .build();
} catch (err) {
  console.error("Error creating Canvafy welcome image:", err);
  console.log(chalk.bgYellow.black(' SYSTEM '), chalk.yellow('WELCOME_FALLBACK'), `${pushname} (${sender})`);
  // Fallback to text message only
  return conn.sendMessage(from, { 
    text: welcomeText, 
    mentions: [sender]
  });
}

// Send welcome message with image and text
await conn.sendMessage(from, {
  image: welcomeImage,
  caption: welcomeText,
  mentions: [sender]
});
console.log(chalk.bgGreen.black(' SYSTEM '), chalk.green.bold('WELCOME_SENT'), `${pushname} (${sender}) -> ${groupName}`); 
}
break;

case "remove": {
if (!chat.welcome || itsMe || !oneMem) return;
// Default leave message template
let leaveText = chat.sBye || "Selamat tinggal @user";
leaveText = leaveText
.replace(/@user/g, `@${senderNumber}`)
.replace(/@subject/g, groupName)
.replace(/@desc/g, groupDesc);

// Generate leave image with Canvafy
let leaveImage;
try {
  const backgroundPath = "./media/welcomeleave.jpg"; // Local file path
  const avatarPath = "./media/user.jpg"; // Default avatar path

  leaveImage = await new canvafy.WelcomeLeave()
    .setAvatar(pp || avatarPath) // Use profile picture or default
    .setBackground("image", backgroundPath)
    .setTitle("Goodbye")
    .setDescription(`Goodbye from ${groupName}`)
    .setBorder("#6200ee")
    .setAvatarBorder("#6200ee")
    .setOverlayOpacity(0.3)
    .build();
} catch (err) {
  console.error("Error creating Canvafy leave image:", err);
  console.log(chalk.bgYellow.black(' SYSTEM '), chalk.yellow('LEAVE_FALLBACK'), `${pushname} (${sender})`);
  // Fallback to text message only
  return conn.sendMessage(from, { 
    text: leaveText, 
    mentions: [sender]
  });
}

// Send leave message with image and text
await conn.sendMessage(from, {
  image: leaveImage,
  caption: leaveText,
  mentions: [sender]
});
console.log(chalk.bgYellow.black(' SYSTEM '), chalk.yellow.bold('LEAVE_SENT'), `${pushname} (${sender}) -> ${groupName}`);
}
break;

default:
console.log("Unknown action:", action);
break;
}

} catch (err) {
console.log("Error in handleWelcomeLeave:", err);
let e = String(err);
if (e.includes("this.isZero")) {
return;
}
if (e.includes("rate-overlimit")) {
return;
}
if (e.includes("Connection Closed")) {
return;
}
if (e.includes("Timed Out")) {
return;
}
console.log(chalk.white("GROUP :"), chalk.green(e));

// Fallback to text message on error
try {
const from = anu.id;
const sender = conn.decodeJid(anu.participants[0]);
const senderNumber = sender.split("@")[0];
const pushname = await conn.getName(sender);
const chat = global.db.data.chats[from];
const groupMetadata = ((conn.chats[from] || {}).metadata || await conn.groupMetadata(from).catch(_ => null))  || {}
const groupName = groupMetadata.subject || "Unknown Group";
const groupDesc = groupMetadata.desc || "Tidak ada deskripsi";

if (chat && chat.welcome) {
if (anu.action === "add") {
let welcomeText = chat.sWelcome || "Welcome @user";
welcomeText = welcomeText
.replace(/@user/g, `@${senderNumber}`)
.replace(/@subject/g, groupName)
.replace(/@desc/g, groupDesc);
conn.sendMessage(from, { text: welcomeText, mentions: [sender] });
} else if (anu.action === "remove") {
let leaveText = chat.sBye || "Selamat tinggal @user";
leaveText = leaveText
.replace(/@user/g, `@${senderNumber}`)
.replace(/@subject/g, groupName)
.replace(/@desc/g, groupDesc);
conn.sendMessage(from, { text: leaveText, mentions: [sender] });
}
}
} catch (fallbackErr) {
console.log("Fallback error:", fallbackErr);
}

let text =`${util.format(anu)}

${util.format(err)}`
conn.sendMessage(ownerBot,{text})
}
};

//Function Update group
export async function groupsUpdate(conn, anu) {
try {
console.log(anu);
} catch (err) {
console.log(err);
}
}