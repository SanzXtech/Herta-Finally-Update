import axios from 'axios';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let [id, zoneId] = text.split(',');
    if (!id || !zoneId) throw `Contoh: ${usedPrefix + command} 533104828,8129`;

    m.reply('Sedang mencari, mohon tunggu...');
    
    try {
        let { data } = await axios.get(`https://vapis.my.id/api/ml-stalk?id=${id}&zoneid=${zoneId}`);
        
        if (!data.status || !data.data || !data.data.data) {
            return m.reply('Gagal mendapatkan data, coba lagi nanti.');
        }

        let userData = data.data.data;

        let result = `
*🔍 Informasi Akun Mobile Legends 🔍*

👤 *Nama Pengguna*: ${userData.userNameGame || 'Tidak diketahui'}
🆔 *ID*: ${userData.gameId || 'Tidak diketahui'}
🌍 *Zona*: ${userData.zoneId || 'Tidak diketahui'}
`;

        m.reply(result);
    } catch (err) {
        console.error(err);
        m.reply('Terjadi kesalahan saat memproses permintaanmu.');
    }
};

handler.help = ['stalkml'];
handler.tags = ['tools'];
handler.command = /^stalkml$/i;
handler.limit = true;

export default handler;