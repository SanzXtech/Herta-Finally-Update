import axios from 'axios';
import cheerio from 'cheerio';

const base = 'https://jkt48.com';

async function schedule(month, year) {
  const now = new Date();
  if (!month) month = now.getMonth() + 1;
  if (!year) year = now.getFullYear();
  const res = await axios.get(`${base}/calendar/list/y/${year}/m/${month}`);
  const $ = cheerio.load(res.data);
  const bulan = $('.entry-schedule__header--center').text().trim();
  const schedule = [];
  $('tr').each((index, element) => {
    let day = {};
    day.hari = $(element).find('h3').text().trim();
    day.events = [];
    $(element).find('.contents').each((index, element) => {
      let event = {};
      event.icon = base + $(element).find('img').attr('src');
      event.name = $(element).find('a').text().trim();
      event.link = base + $(element).find('a').attr('href');
      day.events.push(event);
    });
    schedule.push(day);
  });
  return { bulan, schedule };
}

async function member(q = '') {
  const res = await axios.get(`${base}/member/list?lang=id`);
  const $ = cheerio.load(res.data);
  const member = {};
  $('.row-all-10').each((index, element) => {
    let list = [];
    $(element).find('div').each((index2, element) => {
      let orang = {};
      if (index2 % 2 == 1) return;
      orang.image = base + $(element).find('img').attr('src');
      orang.nama = ("" + $(element).find('p a').html()).replace(/<br>(<\/br>)?/g, ' ');
      orang.link = base + $(element).find('a').attr('href');
      orang.tipe = index == 0 ? 'anggota' : 'trainee';
      list.push(orang);
    });
    if (index == 0) member.anggota = list.filter(_ => _.nama.toLowerCase().includes(q.toLowerCase()));
    else member.trainee = list.filter(_ => _.nama.toLowerCase().includes(q.toLowerCase()));
  });
  if (q) member.search = [...member.anggota, ...member.trainee];
  return member;
}

const handler = async (m, { command, text }) => {
  try {
    const args = text.split(' ');
    const subcommand = args[0] ? args[0].toLowerCase() : '';

    switch (subcommand) {
      case 'schedule':
        const scheduleResult = await schedule();
        let scheduleMsg = `📅 Jadwal JKT48 Bulan ${scheduleResult.bulan}\n\n`;
        scheduleResult.schedule.forEach(day => {
          if (day.events.length > 0) {
            scheduleMsg += `📆 ${day.hari}\n`;
            day.events.forEach(event => {
              scheduleMsg += `- ${event.name}\n`;
            });
            scheduleMsg += '\n';
          }
        });
        m.reply(scheduleMsg);
        break;

      case 'member':
        const memberResult = await member(args.slice(1).join(' ')); // Ambil nama jika ada
        let memberMsg = '';

        if (memberResult.anggota) {
          memberMsg += "🌟 Anggota JKT48:\n";
          memberResult.anggota.forEach(mbr => {
            memberMsg += `- ${mbr.nama}\n`;
          });
          memberMsg += '\n';
        }

        if (memberResult.trainee) {
          memberMsg += "🌱 Trainee JKT48:\n";
          memberResult.trainee.forEach(mbr => {
            memberMsg += `- ${mbr.nama}\n`;
          });
        }

        m.reply(memberMsg);
        break;

      default:
        // Jika pengguna hanya mengetik `.jkt48` tanpa argumen
        m.reply(`❌ Perintah tidak lengkap!\n\n✅ Contoh penggunaan:\n- *.jkt48 member* (Lihat daftar member)\n- *.jkt48 schedule* (Lihat jadwal terbaru)`);
    }
  } catch (error) {
    console.error(error);
    m.reply('Terjadi kesalahan saat memproses permintaan');
  }
};

handler.command = ['jkt48'];
handler.tags = ['info'];
handler.help = ['jkt48 member', 'jkt48 schedule'];

export default handler;