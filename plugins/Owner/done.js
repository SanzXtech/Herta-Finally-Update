import fs from 'fs';
import moment from 'moment'; // Pastikan modul ini diinstal

let handler = async (m, { conn, text }) => {
    const idsaluran = "120363282851754043@newsletter";
    const thumbnail = fs.readFileSync('./media/alert.png'); // Path lokal untuk thumbnail

    try {
        if (!text && !m.quoted) {
            return m.reply('❌ Harap kirim media (foto atau video) dan tambahkan teks deskripsi menggunakan format:\n.done nama barang, harga, jumlah, payment\nContoh: .done Akses Premium, 15000, 30 Hari, Qris');
        }

        if (!text) {
            return m.reply('❌ Harap tambahkan teks deskripsi menggunakan format:\n.done nama barang, harga, jumlah, payment\nContoh: .done Akses Premium, 15000, 30 Hari, Qris');
        }

        if (!m.quoted || !(m.quoted.mtype.includes('imageMessage') || m.quoted.mtype.includes('videoMessage'))) {
            return m.reply('❌ Harap kirim media (foto atau video) dengan teks deskripsi.');
        }

        const now = moment().format('DD-MM-YYYY HH:mm:ss'); // Format tanggal dan waktu
        let [namaBarang, harga, jumlah, payment] = text.split(',').map(v => v.trim());
        if (!namaBarang || !harga || !jumlah || !payment) {
            return m.reply('❌ Format salah! Gunakan: .done nama barang, harga, jumlah, payment\nContoh: .done Akses Premium, 15000, 30 Hari, Qris');
        }

        const transaksiText = `📌 *TRANSAKSI SUKSES* 📌\n\n❏ *📦 Barang*: ${namaBarang}\n❏ *💰 Harga*: Rp.${parseInt(harga).toLocaleString()}\n❏ *🔢 Jumlah*: ${jumlah}\n❏ *💳 Payment*: ${payment}\n❏ *📅 Tanggal*: ${now}\n✅ *Status*: Success`;

        const mediaBuffer = await m.quoted.download();

        if (m.quoted.mtype.includes('imageMessage')) {
            await conn.sendMessage(idsaluran, { 
                image: mediaBuffer, 
                caption: transaksiText,
                contextInfo: {
                    externalAdReply: {
                        title: "📢 Transaksi Baru !!!",
                        body: "Pantau terus informasi transaksi terbaru di channel ini!",
                        thumbnail: thumbnail,
                        sourceUrl: "https://sanzonly.id"
                    }
                }
            }, { quoted: m });

        } else if (m.quoted.mtype.includes('videoMessage')) {
            await conn.sendMessage(idsaluran, { 
                video: mediaBuffer, 
                caption: transaksiText,
                contextInfo: {
                    externalAdReply: {
                        title: "📢 Transaksi Baru !!!",
                        body: "Pantau terus informasi transaksi terbaru di channel ini!",
                        thumbnail: thumbnail,
                        sourceUrl: "https://sanzonly.id"
                    }
                }
            }, { quoted: m });
        }

        m.reply(`✅ Informasi transaksi berhasil dikirim ke channel!`);
    } catch (err) {
        console.error(`❌ Error saat mengirim ke saluran: ${err.message}`);
        m.reply(`❌ Gagal mengirim informasi transaksi ke channel.`);
    }
};

handler.command = ['done'];
handler.tags = ['tools'];
handler.help = [
    'done - Kirim media (foto atau video) dengan teks deskripsi menggunakan format:',
    '.done nama barang, harga, jumlah, payment',
    'Contoh: .done Akses Premium, 15000, 30 Hari, Qris'
];
handler.owner = true;

export default handler;
