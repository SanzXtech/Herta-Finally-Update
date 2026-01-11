let handler = async (m, { usedPrefix, command, q }) => {
if(q == "on"){
if(db.data.chats[m.chat].game) return m.reply("Game sudah aktif di group ini")
global.db.data.chats[m.chat].game = true
m.reply("Berhasil mengaktifkan game pada group ini")
} else if(q == "off"){
if(!db.data.chats[m.chat].game) return m.reply("Game sudah tidak aktif di group ini")
global.db.data.chats[m.chat].game = false
m.reply("Berhasil menonaktifkan game pada group ini")
} else m.reply("Pilih on/off")
  
};

handler.command = ['game'];
handler.tags = ['game'];
handler.admin = true
handler.group = true
export default handler;