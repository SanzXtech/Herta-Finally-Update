let handler = async (m, { conn, command, args }) => {
    let user = global.db.data.users[m.sender];
    let tag = '@' + m.sender.split`@`[0];
    
    let playButton = user.playButton || 0;
    let formattedSubscribers = new Intl.NumberFormat().format(user.subscribers || 0);
    let formattedViewers = new Intl.NumberFormat().format(user.viewers || 0);
    let formattedLike = new Intl.NumberFormat().format(user.like || 0);

    try {
        if (command === 'akunyt') {
            if (!user.youtube_account) {
                return conn.reply(m.chat, `Hey Kamu, iya Kamu ${tag}! 🎥\nBuat akun terlebih dahulu.\nKetik: .createakunyt`, fkontak, { mentions: [m.sender] });
            } else {
                return conn.reply(m.chat, `📈 *Akun YouTube Anda* 📉\n
👤 *Streamer:* ${tag}
🌐 *Channel:* ${user.youtube_account}
👥 *Subscribers:* ${formattedSubscribers}
🪬 *Viewers:* ${formattedViewers}
👍🏻 *Likes:* ${formattedLike}

🏆 *Play Buttons:* 
   🥉 *Silver:* ${playButton >= 1 ? '✅' : '❎'}
   🥈 *Gold:* ${playButton >= 2 ? '✅' : '❎'}
   💎 *Diamond:* ${playButton >= 3 ? '✅' : '❎'}`, fkontak, { mentions: [m.sender] });
            }
        } else if (/live/i.test(command) && args[0] === 'youtuber') {
            // Check if user has a YouTube account
            if (!user.youtube_account) {
                return conn.reply(m.chat, `Hey Kamu, iya Kamu ${tag}! 🎥\nBuat akun terlebih dahulu.\nKetik: .createakunyt`, fkontak, { mentions: [m.sender] });
            }

            // Placeholder untuk logika live youtuber
        } else {
            return await conn.reply(m.chat, `❌ *Perintah tidak dikenali.*\n\n📊 *Cek akun YouTube Anda:*\n➤ *.akunyt*\n\n📹 *Mulai Live Streaming:*\n➤ *.live [judul live]*`, fkontak);
        }
    } catch (err) {
        m.reply("🚨 *Terjadi Kesalahan*\n\n" + err.stack);
    }
};

handler.help = ['akunyt'];
handler.tags = ['rpg'];
handler.command = /^(akunyt)$/i;
handler.register = true;
handler.group = true;

export default handler;