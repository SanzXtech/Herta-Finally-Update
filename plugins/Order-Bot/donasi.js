import axios from 'axios';
import QRCode from 'qrcode';
import moment from 'moment-timezone'; // Library untuk waktu real-time
import fs from 'fs/promises';
import fsSync from 'fs'; // Ensure the correct fs module is imported for synchronous operations

const CHECK_URL = "https://gateway.okeconnect.com/api/mutasi/qris/OK1252519/237397617417687351252519OKCTC62F0469B3E022E632F449E636428B7D";
const CHECK_INTERVAL = 7000; // 7 detik
const TIMEOUT = 3 * 60 * 1000; // 3 menit
const DELAY_BEFORE_NEW_DONATION = 5 * 60 * 1000; // 5 menit
const TRANSACTION_FILE = './database/transaction.json';

async function qrisDinamis(nominal) {
    let qris = "00020101021126670016COM.NOBUBANK.WWW01189360050300000879140214437283327003550303UMI51440014ID.CO.QRIS.WWW0215ID20232751502740303UMI5204481253033605802ID5920AGENTSTORE OK12525196007TANGSEL61051522062070703A0163046F2F";
    let qris2 = qris.slice(0, -4).replace("010211", "010212");
    let pecahQris = qris2.split("5802ID");
    let uang = `54${nominal.toString().length.toString().padStart(2, '0')}${nominal}5802ID`;
    let output = pecahQris[0] + uang + pecahQris[1] + (await toCRC16(pecahQris[0] + uang + pecahQris[1]));

    return await QRCode.toBuffer(output, { margin: 2, scale: 10 });
}

async function toCRC16(str) {
    let crc = 0xFFFF;
    for (let c = 0; c < str.length; c++) {
        crc ^= str.charCodeAt(c) << 8;
        for (let i = 0; i < 8; i++) {
            crc = (crc & 0x8000) ? (crc << 1) ^ 0x1021 : crc << 1;
        }
    }
    let hex = (crc & 0xFFFF).toString(16).toUpperCase();
    return hex.padStart(4, '0');
}

async function saveTransactionToFile(transaction) {
    try {
        // Baca file JSON jika ada, atau buat array kosong
        let transactions = [];
        try {
            const data = await fs.readFile(TRANSACTION_FILE, 'utf-8');
            transactions = JSON.parse(data);
        } catch (err) {
            if (err.code !== 'ENOENT') throw err; // Abaikan jika file tidak ada
        }

        // Cek apakah transaksi sudah ada
        if (transactions.some(trx => trx.issuer_reff === transaction.issuer_reff)) {
            return false; // Transaksi sudah ada
        }

        // Tambahkan transaksi baru
        transactions.push(transaction);
        await fs.writeFile(TRANSACTION_FILE, JSON.stringify(transactions, null, 2));
        return true; // Transaksi baru berhasil disimpan
    } catch (err) {
        console.error(`❌ Error menyimpan transaksi: ${err.message}`);
        return false;
    }
}

async function checkDonation(amount) {
    try {
        console.log("🔍 Memulai pengecekan donasi...");
        let response = await axios.get(CHECK_URL);
        let data = response.data.data;

        if (!data || data.length === 0) {
            console.log("❌ Tidak ada data transaksi dari API.");
            return { success: false, message: "Belum ada donasi masuk." };
        }

        console.log("✅ Data transaksi diterima:", data);

        // Sortir transaksi berdasarkan waktu (descending)
        data.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Baca transaksi yang sudah ada di database
        let existingTransactions = [];
        let latestTransactionTime = 0; // Waktu transaksi terbaru di database
        try {
            const fileData = await fs.readFile(TRANSACTION_FILE, 'utf-8');
            existingTransactions = JSON.parse(fileData);
            latestTransactionTime = Math.max(
                ...existingTransactions.map(trx => new Date(trx.date).getTime())
            );
        } catch (err) {
            if (err.code !== 'ENOENT') throw err; // Abaikan jika file tidak ada
        }

        // Cari transaksi yang cocok dengan validasi tambahan
        let transaction = data.find(trx => 
            trx.amount === amount.toString() &&
            trx.type === "CR" &&
            trx.qris === "static" && // Pastikan QRIS adalah static
            !existingTransactions.some(existing => 
                existing.issuer_reff === trx.issuer_reff &&
                existing.amount === trx.amount &&
                existing.date === trx.date // Pastikan kombinasi unik
            ) &&
            new Date(trx.date).getTime() > latestTransactionTime // Pastikan waktu transaksi lebih baru
        );

        if (transaction) {
            console.log("✅ Transaksi ditemukan:", transaction);

            // Simpan transaksi baru ke file JSON
            const isNew = await saveTransactionToFile(transaction);
            if (!isNew) {
                console.log("⚠️ Transaksi sudah terdeteksi sebelumnya.");
                return { success: false, message: "Transaksi sudah terdeteksi sebelumnya." };
            }

            return {
                success: true,
                issuerReff: transaction.issuer_reff,
                date: transaction.date,
                bank: transaction.brand_name,
                donor: transaction.buyer_reff || "Anonim",
                amount: transaction.amount
            };
        } else {
            console.log("⏳ Tidak ada transaksi yang cocok. Menunggu donasi masuk...");
            return { success: false, message: "Menunggu donasi masuk..." };
        }
    } catch (error) {
        console.error("❌ Error saat memeriksa donasi:", error.message);
        return { success: false, message: `Error: ${error.message}` };
    }
}

async function getProfilePicture(conn, sender) {
    try {
        return await conn.profilePictureUrl(sender, 'image');
    } catch {
        return './media/alert.png'; // Default thumbnail if no profile picture
    }
}

async function startChecking(conn, sender) {
    let { amount, time, message } = conn.donate[sender];

    while (true) {
        let result = await checkDonation(amount);

        if (result.success) {
            const profilePicture = await getProfilePicture(conn, sender);
            const alertText = `🎉 *Donasi Diterima!* 🎉\n\n` +
                `💸 *Jumlah:* Rp ${result.amount.toLocaleString("id-ID")}\n` +
                `🏦 *Bank:* ${result.bank}\n` +
                `👤 *Donatur:* ${conn.getName(sender)}\n` +
                `📅 *Waktu:* ${result.date}\n` +
                `📩 *Pesan:* ${message || "Tidak ada pesan."}\n\n` +
                `🙏 Terima kasih atas dukungan Anda! 💖`;

            await sendch(alertText, conn, {}, profilePicture); // Send alert with profile picture
            await deleteQrisMessage(conn, conn.donate[sender]?.qrisMessageKey);

            // Send audio to channel
            const audioPath = "./media/audiodonasi.mp3"; // Local audio
            await sendAudioToChannel(audioPath, conn, "Terima kasih atas donasi Anda!");

            conn.donate[sender].lastSuccess = Date.now(); // Mark success time
            delete conn.donate[sender]; // Remove donation data after success
            return result;
        }

        if ((Date.now() - time) >= TIMEOUT) {
            delete conn.donate[sender]; // Remove data after timeout
            return { success: false, message: "Batas waktu habis." };
        }

        await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL));
    }
}

let handler = async (m, { conn, text, prefix, command }) => {
    let sender = m.sender;

    if (!conn.donate) conn.donate = {};
    if (global.donationSession) {
        return m.reply("🚫 Sesi donasi sedang berlangsung. Mohon tunggu hingga 3 menit sebelum mencoba lagi.");
    }

    if (conn.donate[sender]) {
        return m.reply("🚫 Anda sudah memiliki transaksi donasi yang sedang diproses! Mohon tunggu hingga selesai.");
    }

    if (conn.donate[sender]?.lastSuccess && 
        Date.now() - conn.donate[sender].lastSuccess < DELAY_BEFORE_NEW_DONATION) {
        return m.reply("⏳ Harap tunggu 5 menit sebelum melakukan donasi lagi.");
    }

    let [num, donorMessage] = text.split(/[.|]/).map(t => t?.trim() || "");
    if (!num || isNaN(num) || Number(num) < 1000) 
        return m.reply(`🚫 Minimal donasi adalah Rp 1.000. Gunakan format: ${prefix + command} <jumlah>. <pesan>`);

    if (!donorMessage) 
        return m.reply(`Harap sertakan pesan untuk donasi! Gunakan: ${prefix + command} <jumlah>. <pesan>`);

    let amount = parseInt(num.trim(), 10);
    let qrBuffer = await qrisDinamis(amount.toString());
    const profilePicture = await getProfilePicture(conn, sender);

    const sent = await conn.sendImage(m.chat, qrBuffer, 
    `🎗️ *DONASI HERTA* 🎗️\n\n` +
    `💰 *Jumlah:* Rp ${amount.toLocaleString("id-ID")}\n` +
    `📌 Silakan scan *QRIS* di atas untuk menyelesaikan donasi.\n\n` +
    `🙏 Terima kasih atas dukungan Anda! 💖`, 
    m, { thumbnail: profilePicture }
);

conn.donate[sender] = {
    amount,
    time: Date.now(),
    message: donorMessage,
    qrisMessageKey: sent.key // Simpan ID pesan QRIS
};

    global.donationSession = true; // Start global donation session
    startChecking(conn, sender).finally(() => {
        global.donationSession = false; // End global donation session
    });
};

handler.command = ["donasi", "donate"];
handler.tags = ["main"];
handler.help = ["donasi <jumlah>. <pesan>"];

export default handler;

const sendch = async (teks, conn, m, thumbnail) => {
    const idsaluran = "120363282851754043@newsletter";

    try {
        await conn.sendMessage(idsaluran, { 
            image: { url: './media/alert.png' }, // Use default thumbnail from media folder
            caption: teks, 
            contextInfo: {
                externalAdReply: {
                    title: "🎉 Notifikasi Donasi 🎉",
                    body: "Terima kasih atas dukungan Anda!",
                    thumbnail: fsSync.readFileSync('./media/alert.png'), // Use default thumbnail
                    sourceUrl: "sanzonly.id" // Replace with relevant URL
                }
            }
        }, { quoted: m });

        console.log("✅ Notifikasi berhasil dikirim ke saluran!");
    } catch (err) {
        console.error(`❌ Error saat mengirim notifikasi ke saluran: ${err.message}`);
    }
};

const sendAudioToChannel = async (audioPath, conn) => {
    const idsaluran = "120363282851754043@newsletter";

    try {
        await conn.sendMessage(idsaluran, { 
            audio: { url: audioPath }, // Use local audio
            mimetype: 'audio/mpeg', 
            ptt: true, // Set to true if sent as a voice note
        });

        console.log("✅ Audio berhasil dikirim ke saluran!");
    } catch (err) {
        console.error(`❌ Error saat mengirim audio ke saluran: ${err.message}`);
    }
};

// Hapus pesan QRIS berdasarkan message key
async function deleteQrisMessage(conn, key) {
    try {
        if (key) {
            await conn.sendMessage(key.remoteJid, { delete: key });
            console.log("🗑️ Pesan QRIS berhasil dihapus.");
        }
    } catch (err) {
        console.error("❌ Gagal menghapus pesan QRIS:", err.message);
    }
}
