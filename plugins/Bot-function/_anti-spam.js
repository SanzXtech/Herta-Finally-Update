let handler = (m) => m;
handler.before = async function (m, { conn,isOwner }) {
// NEW ANTI SPAM
if(!m.isGroup) return
const isSticker = (m.type === 'stickerMessage');
const isText = (m.type === 'extendedTextMessage');

// Normalize timestamp (support both pbjs Long and number)
const ts = (m && m.messageTimestamp && typeof m.messageTimestamp.toNumber === 'function') ? m.messageTimestamp.toNumber() : (Number(m.messageTimestamp) || Math.floor(Date.now()/1000));

conn.spamSticker = conn.spamSticker ? conn.spamSticker : {};
conn.spamText = conn.spamText ? conn.spamText : {};


const chat = db.data.chats[m.chat]
if (chat && chat.antispam) {


    if (isSticker) {
        if (m.sender in conn.spamSticker) {
            conn.spamSticker[m.sender].count += 1
            let timeSinceLastSpam = ts - conn.spamSticker[m.sender].lastspam;
            
            if (timeSinceLastSpam <= 3) {
                if (conn.spamSticker[m.sender].count > 3) {
                    let name = m.pushname || await conn.getName(m.sender);
                    let teks = `Terdeteksi nomor ${m.senderNumber} telah melakukan spam sticker lebih dari 5 kali, bot akan kick otomatis. Untuk menonaktifkan fitur ini ketik antispam off.`;

                    m.reply(teks);
                    conn.spamSticker[m.sender].count = 0;
                    await sleep(2000)
                    if(isOwner) return m.reply("Tolong jangan spam ya ka")

                    // Implementasikan logika untuk kick user di sini
                    if(m.isBotAdmin) conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
                }
            } else {
                conn.spamSticker[m.sender].count = 1; // Reset count jika lebih dari 1 menit
                conn.spamSticker[m.sender].lastspam = ts;
            }
        } else {
            conn.spamSticker[m.sender] = {
                count: 1,
                lastspam: ts
            };
        }
    }



    if (isText) {
        if (m.sender in conn.spamText) {
            conn.spamText[m.sender].count += 1
            let timeSinceLastSpam = ts - conn.spamText[m.sender].lastspam;
            
            if (timeSinceLastSpam <= 5) {
                if (conn.spamText[m.sender].count > 5) {
                    let name = m.pushname || await conn.getName(m.sender);
                    let teks = `Terdeteksi nomor ${m.senderNumber} telah melakukan spam text lebih dari 10 kali, bot akan kick otomatis. Untuk menonaktifkan fitur ini ketik antispam off.`;

                    m.reply(teks);
                    conn.spamText[m.sender].count = 0;
                    if(isOwner) return m.reply("Tolong jangan spam ya ka")

                    // Implementasikan logika untuk kick user di sini
                    if(m.isBotAdmin) conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
                }
            } else {
                conn.spamText[m.sender].count = 1; // Reset count jika lebih dari 1 menit
                conn.spamText[m.sender].lastspam = ts;
            }
        } else {
            conn.spamText[m.sender] = {
                count: 1,
                lastspam: ts
            };
        }
    }





}

};
export default handler;
