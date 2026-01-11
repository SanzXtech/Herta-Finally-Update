const handler = async (m, { conn, usedPrefix, args, command }) => {
  conn.jbRooms = conn.jbRooms || {};
  conn.jbVotes = conn.jbVotes || {};

  const clubs = [
    "Real Madrid", "Manchester United", "Inter Milan", "Barcelona",
    "Liverpool", "Paris Saint-Germain", "Chelsea", "Juventus",
    "Borussia Dortmund", "Atletico Madrid", "RB Leipzig", "Porto",
    "Arsenal", "Shakhtar Donetsk", "Red Bull Salzburg", "AC Milan",
    "Braga", "PSV Eindhoven", "Lazio", "Red Star Belgrade", "FC Copenhagen"
  ];

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  };

  const getRandomWinner = () => {
    return Math.random() > 0.5 ? "1" : "2";  // Secara acak memilih pemenang (1 atau 2)
  };

  const adminNumber = '6281401689098@s.whatsapp.net'; // Nomor admin dalam format WhatsApp ID

  if (!args[0] || args[0] === "help") {
    const message = `*❏ JUDI BOLA ⚽*

• ${usedPrefix}jb create (buat room) 
• ${usedPrefix}jb join (player join, taruhan 1000000)
• ${usedPrefix}jb player (daftar pemain yang bergabung)
• ${usedPrefix}jb mulai (mulai game)
• ${usedPrefix}jb vote 1/2 (vote klub pilihan)
• ${usedPrefix}jb delete (hapus sesi room game)

Minimal 2 pemain. Taruhan: 1000000`;
    await conn.sendMessage(m.chat, {
      text: message,
      contextInfo: {
        externalAdReply: {
          title: "JUDI BOLA",
          body: 'Ayo ikut dan menangkan hadiahnya!',
          thumbnailUrl: 'https://telegra.ph/file/3463760976052aeac5f21.jpg',
          sourceUrl: myUrl,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    });
    return;
  }

  switch (args[0].toLowerCase()) {
    case 'create':
      if (conn.jbRooms[m.chat]) {
        return m.reply('Room sudah ada.');
      }
      conn.jbRooms[m.chat] = {
        players: [],
        gameStarted: false,
        clubs: [],
        votes: {},
        money: 0
      };
      m.reply('Room berhasil dibuat. Pemain sekarang bisa bergabung.');
      break;

    case 'join':
      if (!conn.jbRooms[m.chat]) {
        return m.reply('Belum ada room yang dibuat. Gunakan .jb create untuk membuat room.');
      }
      if (conn.jbRooms[m.chat].gameStarted) {
        return m.reply('Game sudah dimulai. Tidak bisa bergabung sekarang.');
      }
      if (conn.jbRooms[m.chat].players.find(p => p.id === m.sender)) {
        return m.reply('Anda sudah bergabung di room.');
      }

      const playerData = db.data.users[m.sender];
      const taruhan = 1000000;

      if (playerData.money < taruhan) {
        return m.reply('Saldo Anda tidak cukup untuk taruhan.');
      }

      playerData.money -= taruhan;
      const playerName = m.pushName || conn.getName(m.sender);
      conn.jbRooms[m.chat].players.push({ id: m.sender, name: playerName });
      conn.jbRooms[m.chat].money += taruhan;
      m.reply(`Anda berhasil bergabung. Taruhan: ${taruhan}. Total taruhan: ${conn.jbRooms[m.chat].money}. Sisa saldo Anda: ${playerData.money}`);
      break;

    case 'player':
      if (!conn.jbRooms[m.chat]) {
        return m.reply('Belum ada room yang dibuat.');
      }
      const players = conn.jbRooms[m.chat].players;
      m.reply(`Pemain yang bergabung: \n${players.map(p => `${p.name} (${p.id})`).join('\n')}`);
      break;

    case 'mulai':
      if (!conn.jbRooms[m.chat]) {
        return m.reply('Belum ada room yang dibuat.');
      }
      if (conn.jbRooms[m.chat].players.length < 2) {
        return m.reply('Minimal 2 pemain untuk memulai game.');
      }
      shuffleArray(clubs);
      conn.jbRooms[m.chat].clubs = [clubs[0], clubs[1]];
      conn.jbRooms[m.chat].gameStarted = true;

      // Kirim taruhan ke nomor admin
      const totalTaruhan = conn.jbRooms[m.chat].money;
      const adminUser = db.data.users[adminNumber]; // Gunakan format WhatsApp ID untuk nomor admin

      if (adminUser) {
        adminUser.money += totalTaruhan;
        m.reply(`Total taruhan sebesar ${totalTaruhan} telah dikirim ke admin slot.`);
      } else {
        m.reply('Nomor admin tidak ditemukan dalam database.');
      }

      // Mulai game
      m.reply(`Game dimulai! Pertandingan: 1 ${clubs[0]} vs 2 ${clubs[1]}. Silakan vote dalam 60 detik.`);

      // Timer untuk memulai game dalam 60 detik
      setTimeout(() => {
        if (Object.keys(conn.jbRooms[m.chat].votes).length < conn.jbRooms[m.chat].players.length) {
          m.reply('Tidak semua pemain melakukan vote. Game dimulai dengan pemain yang telah vote.');

          const winnerVote = getRandomWinner();
          const winningClub = conn.jbRooms[m.chat].clubs[winnerVote - 1];
          const winners = conn.jbRooms[m.chat].players.filter(player => conn.jbRooms[m.chat].votes[player.id] === winnerVote);

          const prizePerWinner = 2500000;  // Hadiah tetap 2500000 per pemenang

          m.reply(`Pertandingan telah selesai.\nPemenang adalah ${winningClub}.\nPemain yang menang:\n${winners.map(w => w.name).join('\n')}\n\nSetiap pemenang mendapatkan ${prizePerWinner}.`);

          winners.forEach(winner => {
            db.data.users[winner.id].money += prizePerWinner;
          });

          m.reply('Hadiah telah ditransfer.');
        }

        // Bersihkan room setelah game selesai
        delete conn.jbRooms[m.chat];
        delete conn.jbVotes[m.chat];
      }, 60000); // 60 detik timeout
      break;

    case 'vote':
      if (!conn.jbRooms[m.chat]) {
        return m.reply('Belum ada room.');
      }
      if (!conn.jbRooms[m.chat].gameStarted) {
        return m.reply('Game belum dimulai.');
      }
      if (!args[1] || !['1', '2'].includes(args[1])) {
        return m.reply('Pilihan tidak valid.');
      }
      const vote = args[1];
      const currentRoom = conn.jbRooms[m.chat];
      const player = currentRoom.players.find(p => p.id === m.sender);
      if (!player) {
        return m.reply('Anda belum bergabung.');
      }

      conn.jbVotes[m.sender] = vote;
      currentRoom.votes[m.sender] = vote;
      m.reply(`Anda memilih klub nomor ${vote}.`);

      if (Object.keys(currentRoom.votes).length === currentRoom.players.length) {
        m.reply('Semua pemain telah vote. Pertandingan akan segera dimulai...');

        setTimeout(() => {
          m.reply('Pertandingan dimulai. Tunggu...');

          setTimeout(() => {
            const winnerVote = getRandomWinner();
            const winningClub = currentRoom.clubs[winnerVote - 1];
            const winners = currentRoom.players.filter(player => conn.jbVotes[player.id] === winnerVote);

            const prizePerWinner = 2500000;  // Hadiah tetap 2500000 per pemenang

            m.reply(`Pertandingan telah selesai.\nPemenang adalah ${winningClub}.\nPemain yang menang:\n${winners.map(w => w.name).join('\n')}\n\nSetiap pemenang mendapatkan ${prizePerWinner}.`);

            winners.forEach(winner => {
              db.data.users[winner.id].money += prizePerWinner;
            });

            m.reply('Hadiah telah ditransfer.');

            delete conn.jbRooms[m.chat];
            delete conn.jbVotes[m.chat];
          }, 25000);
        }, 25000);
      } else {
        m.reply(`Menunggu pemain lain untuk vote. ${currentRoom.players.length - Object.keys(currentRoom.votes).length} pemain lagi.`);
      }
      break;

    case 'delete':
      if (!conn.jbRooms[m.chat]) {
        return m.reply('Belum ada room.');
      }
      delete conn.jbRooms[m.chat];
      delete conn.jbVotes[m.chat];
      m.reply('Room telah dihapus.');
      break;

    default:
      m.reply('Perintah tidak dikenal. Gunakan .jb help.');
  }
};

handler.help = ['judibola'];
handler.tags = ['game'];
handler.command = /^(judibola|jb)$/i;
handler.rpg = true;
handler.group = true;
handler.register = true;

export default handler;
