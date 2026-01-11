let handler = async (m, { conn, command, args }) => {
  let user = global.db.data.users[m.sender];
  const tag = '@' + m.sender.split`@`[0];

  try {
    if (command === 'liveyt') {
      // Cek apakah pengguna sudah memiliki akun YouTube
      if (!user.youtube_account) {
        return conn.reply(m.chat, `Hey Kamu Iya Kamu ${tag}\nBuat akun terlebih dahulu\nKetik: .createakunyt`, fkontak, { mentions: [m.sender] });
      }

      // Cek apakah judul live diberikan
      let title = args.join(' ');
      if (!title) {
        return conn.reply(m.chat, `${tag} Silakan berikan judul untuk live Anda.`, fkontak, { mentions: [m.sender] });
      }

      // Cooldown 10 menit
      const cooldownTime = 3600000; // 10 menit dalam milidetik
      const lastLiveTime = user.lastLiveTime || 0;
      const timeSinceLastLive = new Date() - lastLiveTime;

      if (timeSinceLastLive < cooldownTime) {
        const remainingCooldown = cooldownTime - timeSinceLastLive;
        const formattedCooldown = msToTime(remainingCooldown);
        throw `Kamu sudah lelah. Tunggu selama\n${formattedCooldown}`;
      }

      setTimeout(() => {
        conn.reply(m.chat, `👋 Hai Kak ${tag}, subscribermu sudah menunggu,\nwaktunya untuk live streaming kembali!`, fkontak, { mentions: [m.sender] });
      }, cooldownTime);

      // Simulasi live streaming
      const randomSubscribers = Math.floor(Math.random() * (3000 - 10 + 1)) + 10;
      const randomLike = Math.floor(Math.random() * (1000 - 20 + 1)) + 20;
      const randomViewers = Math.floor(Math.random() * (1000000 - 100 + 1)) + 100;
      const randomDonation = Math.floor(Math.random() * (200000 - 10000 + 1)) + 10000;
      const formattedSubscribers = new Intl.NumberFormat().format(user.subscribers);
      const formattedLike = new Intl.NumberFormat().format(user.like);
      const formattedViewers = new Intl.NumberFormat().format(user.viewers);

      // Update data pengguna
      user.subscribers += randomSubscribers;
      user.like += randomLike;
      user.viewers += randomViewers;
      user.money += randomDonation;
      user.lastLiveTime = new Date();

      // Pengecekan Play Button reward berdasarkan milestone subscribers
      if (user.subscribers >= 1000000 && user.playButton < 3) {
        user.playButton += 1;
        user.money += Math.floor(Math.random() * (1000000 - 500000 + 1)) + 500000; // Reward money
        user.exp += 5000; // Reward EXP
        conn.reply(m.chat, `📢 Selamat! Kamu telah mencapai 1 Juta Subscribers dan mendapatkan *🥇 Diamond PlayButton* 🎉\n\n💰 Hadiah: Money & EXP\n📢 Cek progres dengan *.akunyt*`, fkontak, { mentions: [m.sender] });
      } else if (user.subscribers >= 100000 && user.playButton < 2) {
        user.playButton += 1;
        user.money += Math.floor(Math.random() * (500000 - 300000 + 1)) + 300000; // Reward money
        user.exp += 2500; // Reward EXP
        conn.reply(m.chat, `📢 Selamat! Kamu telah mencapai 100K Subscribers dan mendapatkan *🥈 Gold PlayButton* 🎉\n\n💰 Hadiah: Money & EXP\n📢 Cek progres dengan *.akunyt*`, fkontak, { mentions: [m.sender] });
      } else if (user.subscribers >= 10000 && user.playButton < 1) {
        user.playButton += 1;
        user.money += Math.floor(Math.random() * (250000 - 10000 + 1)) + 10000; // Reward money
        user.exp += 500; // Reward EXP
        conn.reply(m.chat, `📢 Selamat! ${tag}, kamu telah mencapai 10K Subscribers dan mendapatkan *🥉 Silver PlayButton* 🎉\n\n💰 Hadiah: Money & EXP\n📢 Cek progres dengan *.akunyt*`, fkontak, { mentions: [m.sender] });
      }

      // Kirim hasil live streaming
      conn.reply(m.chat, `
[ 🎦 ] Hasil Live Streaming

🧑🏻‍💻 *Streamer:* ${tag}
📹 *Judul Live:* ${title}
📈 *New Subscribers:* +${new Intl.NumberFormat('en-US').format(randomSubscribers)}
👍🏻 *New Like:* +${new Intl.NumberFormat('en-US').format(randomLike)}
🪬 *New Viewers:* +${new Intl.NumberFormat('en-US').format(randomViewers)}
💵 *Donasi:* Rp.${new Intl.NumberFormat('en-US').format(randomDonation)}

📊 *Total Like:* ${formattedLike}
📊 *Total Viewers:* ${formattedViewers}
📊 *Total Subscribers:* ${formattedSubscribers}

> Cek akun YouTube Anda
> Ketik:  .akunyt`, fkontak, { mentions: [m.sender] });
    }
  } catch (err) {
    m.reply("📢: " + err);
  }
};

// Fungsi konversi waktu cooldown
function msToTime(duration) {
  const seconds = Math.floor((duration / 1000) % 60);
  const minutes = Math.floor((duration / (1000 * 60)) % 60);
  const hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  const formattedTime = [];
  if (hours > 0) {
    formattedTime.push(`${hours} jam`);
  }
  if (minutes > 0) {
    formattedTime.push(`${minutes} menit`);
  }
  if (seconds > 0 || (hours === 0 && minutes === 0)) {
    formattedTime.push(`${seconds} detik`);
  }

  return formattedTime.join(' ');
}

// Konfigurasi command handler
handler.help = ['live'];
handler.tags = ['rpg'];
handler.command = /^(liveyt|streamingyt)/i;
handler.register = true;
handler.group = true;

// Export handler
export default handler;