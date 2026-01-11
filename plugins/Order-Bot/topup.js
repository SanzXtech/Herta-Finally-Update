import fs from 'fs/promises';
import toMs from "ms";
import moment from "moment-timezone";
import QRCode from 'qrcode';
import axios from 'axios';

const CHECK_URL = "https://gateway.okeconnect.com/api/mutasi/qris/OK1252519/237397617417687351252519OKCTC62F0469B3E022E632F449E636428B7D";
const CHECK_INTERVAL = 7000; // 7 detik
const TIMEOUT = 5 * 60 * 1000; // 5 menit
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
        let transactions = [];
        try {
            const data = await fs.readFile(TRANSACTION_FILE, 'utf-8');
            transactions = JSON.parse(data);
        } catch (err) {
            if (err.code !== 'ENOENT') throw err;
        }

        if (transactions.some(trx => trx.issuer_reff === transaction.issuer_reff)) {
            return false;
        }

        transactions.push(transaction);
        await fs.writeFile(TRANSACTION_FILE, JSON.stringify(transactions, null, 2));
        return true;
    } catch (err) {
        console.error(`❌ Error saving transaction: ${err.message}`);
        return false;
    }
}

async function checkTransaction(amount) {
    try {
        console.log("🔍 Memulai pengecekan transaksi...");
        let response = await axios.get(CHECK_URL);
        let data = response.data.data;

        if (!data || data.length === 0) {
            console.log("❌ Tidak ada data transaksi dari API.");
            return { success: false, message: "Belum ada transaksi masuk." };
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
            console.log("⏳ Tidak ada transaksi yang cocok. Menunggu transaksi masuk...");
            return { success: false, message: "Menunggu transaksi masuk..." };
        }
    } catch (error) {
        console.error("❌ Error saat memeriksa transaksi:", error.message);
        return { success: false, message: `Error: ${error.message}` };
    }
}

function notifyOwner(transaction) {
    const ownerJid = global.nomerOwner + "@s.whatsapp.net";
    const message = `📢 *Transaksi Berhasil*\n\n` +
        `💰 *Jumlah:* Rp ${transaction.amount.toLocaleString("id-ID")}\n` +
        `📦 *Item:* ${transaction.item}\n` +
        `🔢 *Detail:* ${transaction.quantity || transaction.duration}\n` +
        `👤 *User:* ${transaction.user}\n` +
        `📅 *Tanggal:* ${moment(transaction.date).tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm')}`;
    conn.sendMessage(ownerJid, { text: message });
}

function isDuplicateSession(conn, sender, amount) {
    return conn.topup && conn.topup[sender] && conn.topup[sender].amount === amount;
}

async function startChecking(conn, sender) {
    let { amount, time, item, quantity, duration } = conn.topup[sender];

    while (true) {
        let result = await checkTransaction(amount);

        if (result.success) {
            console.log("✅ Pembayaran berhasil diterima.");
            if (item === 'chip') {
                global.db.data.users[sender].chip = (global.db.data.users[sender].chip || 0) + parseInt(quantity, 10);
                conn.sendMessage(sender, { text: `*Pembelian ${quantity} Chip telah Success ✅*` });
            } else if (item === 'premium') {
                addPremium(sender, duration === 'permanent' ? 'permanent' : `${duration} month`);
                conn.sendMessage(sender, { text: `*Pembelian Premium telah Success ✅*` });
            }

            notifyOwner({ 
                amount, 
                item, 
                quantity, 
                duration, 
                user: sender, 
                date: result.date 
            });

            delete conn.topup[sender];
            return result;
        }

        if ((Date.now() - time) >= TIMEOUT) {
            console.log("❌ Sesi pembayaran telah habis.");
            delete conn.topup[sender];
            conn.sendMessage(sender, { text: "❌ Sesi pembayaran telah habis. Silakan coba lagi." });
            return { success: false, message: "Timeout." };
        }

        await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL));
    }
}

async function addPremium(user, duration) {
    // Ensure the user object exists before modifying it
    if (!global.db.data.users[user]) {
        global.db.data.users[user] = {
            name: conn.getName(user),
            premium: false,
            premiumTime: 0,
            timeOrder: null,
            timeEnd: null
        };
    }

    // Update user properties
    let userObj = global.db.data.users[user];
    userObj.premium = true;
    userObj.premiumTime = (duration.toLowerCase() === "permanent" || duration.toLowerCase() === "unlimited") 
        ? Infinity 
        : Date.now() + (parseInt(duration) * 30 * 24 * 60 * 60 * 1000); // Convert months to milliseconds

    userObj.timeOrder = moment().tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm');
    userObj.timeEnd = (duration.toLowerCase() === "permanent" || duration.toLowerCase() === "unlimited") 
        ? "Unlimited" 
        : moment(Date.now() + (parseInt(duration) * 30 * 24 * 60 * 60 * 1000)).tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm');
}

function isPaymentSessionActive(conn, sender) {
    return conn.topup && conn.topup[sender];
}

let handler = async (m, { conn, text, prefix, command }) => {
    let sender = m.sender;

    if (!conn.topup) {
        conn.topup = {};
    }

    if (isPaymentSessionActive(conn, sender)) {
        return m.reply("❌ Anda masih memiliki sesi pembayaran yang aktif. Harap selesaikan atau tunggu hingga sesi selesai.");
    }
  
    if (!text) {
        return m.reply(
            `*Silahkan pilih item*
- Chip
- Premium

*Example:*
${prefix + command} chip`
        );
    }

    let args = text.split(' ');
    let item = args[0].toLowerCase();
    let quantity = args[1]?.toLowerCase();

    if (item === 'chip') {
        if (!quantity) {
            return m.reply(
                `*Berikut adalah list harga chip*
- 100 Chip = Rp 10.000
- 250 Chip = Rp 20.000
- 500 Chip = Rp 30.000
- 750 Chip = Rp 40.000
- 1000 Chip = Rp 50.000

*Example:*
${prefix + command} chip 100`
            );
        }

        const chipPrices = {
            '100': 10000,
            '250': 20000,
            '500': 30000,
            '750': 40000,
            '1000': 50000
        };

        if (!chipPrices[quantity]) {
            return m.reply("❌ Pilihan jumlah chip tidak valid.");
        }

        let amount = chipPrices[quantity];

        if (isDuplicateSession(conn, sender, amount)) {
            return m.reply("❌ Anda sudah memiliki sesi pembayaran dengan nominal yang sama. Harap selesaikan atau tunggu hingga sesi selesai.");
        }

        let qrBuffer = await qrisDinamis(amount);

        await conn.sendImage(m.chat, qrBuffer, 
            `🎗️ *TOP UP CHIP* 🎗️\n\n` +
            `💰 *Jumlah:* Rp ${amount.toLocaleString("id-ID")}\n` +
            `📦 *Item:* ${item}\n` +
            `🔢 *Jumlah:* ${quantity}\n` +
            `📌 Silakan scan *QRIS* di atas untuk menyelesaikan pembayaran.\n\n` +
            `🙏 Terima kasih atas dukungan Anda! 💖`, 
            m
        );

        conn.topup[sender] = {
            amount,
            time: Date.now(),
            item: 'chip',
            quantity: parseInt(quantity, 10)
        };
        startChecking(conn, sender);
    } else if (item === 'premium') {
        if (!quantity) {
            return m.reply(
                `*Berikut adalah harga premium*
- 1 Bulan = Rp 15.000
- 2 Bulan = Rp 30.000
- 3 Bulan = Rp 45.000
- 4 Bulan = Rp 60.000
- 5 Bulan = Rp 75.000
- 6 Bulan = Rp 90.000
- Permanent = Rp 100.000

*Example:*
${prefix + command} premium 1
${prefix + command} premium permanent`
            );
        }

        const premiumPrices = {
            '1': 15000,
            '2': 30000,
            '3': 45000,
            '4': 60000,
            '5': 75000,
            '6': 90000,
            'permanent': 100000
        };

        if (!premiumPrices[quantity]) {
            return m.reply("❌ Pilihan durasi premium tidak valid.");
        }

        let amount = premiumPrices[quantity];

        if (isDuplicateSession(conn, sender, amount)) {
            return m.reply("❌ Anda sudah memiliki sesi pembayaran dengan nominal yang sama. Harap selesaikan atau tunggu hingga sesi selesai.");
        }

        let qrBuffer = await qrisDinamis(amount);

        await conn.sendImage(m.chat, qrBuffer, 
            `🎗️ *TOP UP PREMIUM* 🎗️\n\n` +
            `💰 *Jumlah:* Rp ${amount.toLocaleString("id-ID")}\n` +
            `📦 *Item:* ${item}\n` +
            `⏳ *Durasi:* ${quantity}\n` +
            `📌 Silakan scan *QRIS* di atas untuk menyelesaikan pembayaran.\n\n` +
            `🙏 Terima kasih atas dukungan Anda! 💖`, 
            m
        );

        conn.topup[sender] = {
            amount,
            time: Date.now(),
            item: 'premium',
            duration: quantity === 'permanent' ? 'permanent' : parseInt(quantity, 10)
        };

        startChecking(conn, sender);
    } else {
        return m.reply("❌ Pilihan item tidak valid.");
    }
};

handler.command = ["topup"];
handler.tags = ["main"];
handler.help = ["topup <item>"];

export default handler;
