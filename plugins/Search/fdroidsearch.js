import axios from 'axios'
import cheerio from 'cheerio'

async function search(query) {
  try {
    const response = await axios.get('https://search.f-droid.org/?q=' + query + '&lang=id');
    const html = response.data;
    const $ = cheerio.load(html);
    const apps = [];

    $('a.package-header').each((index, element) => {
      const appName = $(element).find('h4.package-name').text().trim();
      const appDesc = $(element).find('span.package-summary').text().trim();
      const appLink = $(element).attr('href');
      const appIcon = $(element).find('img.package-icon').attr('src');
      const appLicense = $(element).find('span.package-license').text().trim();

      apps.push({
        name: appName,
        description: appDesc,
        link: appLink,
        icon: appIcon,
        license: appLicense
      });
    });

    return apps;
  } catch (error) {
    console.error('Error fetching apps:', error);
    return []
  }
}

async function detail(url) {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);
    const appDetails = {};

    const versionElement = $('li.package-version#latest');
    const versionText = versionElement.find('.package-version-header').text().trim();
    const versionMatch = versionText.match(/Versi\s+([\d.]+)/);

    appDetails.version = versionMatch ? versionMatch[1] : versionText.replace(/[^0-9.]/g, '').split(/\s+/)[0];
    appDetails.addedOn = versionElement.find('.package-version-header').text().match(/Ditambahkan pada (.+)/)?.[1].trim();
    appDetails.requirement = versionElement.find('.package-version-requirement').text().trim();
    appDetails.sourceLink = versionElement.find('.package-version-source a').attr('href');
    appDetails.permissions = versionElement.find('.package-version-permissions .no-permissions').text().trim() || 'Permissions not listed';
    appDetails.downloadLink = versionElement.find('.package-version-download a').attr('href');
    appDetails.apkSize = versionElement.find('.package-version-download').contents().filter(function() {
      return this.nodeType === 3;
    }).text().trim().split('|')[0].trim();

    return appDetails;
  } catch (error) {
    console.error('Error fetching app details:', error);
    return null
  }
}

export async function handler(m, { conn, text, command }) {
  if (!text) return m.reply('Masukkan nama aplikasi')

  try {
    if (command === 'fdroidsearch') {
      const results = await search(text)
      if (results.length === 0) return m.reply('Tidak ada aplikasi ditemukan')

      let msg = '*📱 F-DROID SEARCH RESULTS 📱*\n\n'
      results.forEach((app, index) => {
        msg += `*${index + 1}. ${app.name}*\n`
        msg += `📖 ${app.description}\n`
        msg += `🔗 Link: ${app.link}\n`
        msg += `📜 License: ${app.license}\n\n`
      })

      m.reply(msg)
    } else if (command === 'fdroiddetail') {
      const appDetails = await detail(text)
      if (!appDetails) return m.reply('Gagal mengambil detail aplikasi')

      let msg = '*📱 F-DROID APP DETAILS 📱*\n\n'
      msg += `📦 Versi: ${appDetails.version}\n`
      msg += `📅 Ditambahkan: ${appDetails.addedOn}\n`
      msg += `🔍 Persyaratan: ${appDetails.requirement}\n`
      msg += `📋 Izin: ${appDetails.permissions}\n`
      msg += `💾 Ukuran APK: ${appDetails.apkSize}\n`
      msg += `⬇️ Download: ${appDetails.downloadLink}\n`
      msg += `🔗 Sumber: ${appDetails.sourceLink}`

      m.reply(msg)
    }
  } catch (error) {
    console.error(error)
    m.reply('Terjadi kesalahan')
  }
}

handler.command = ['fdroidsearch', 'fdroiddetail']
handler.help = ['fdroidsearch <nama aplikasi>', 'fdroiddetail <url detail aplikasi>']
handler.tags = ['downloader', 'internet']

export default handler