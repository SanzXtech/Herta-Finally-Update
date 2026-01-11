const moneykagetCooldown = 30 * 60 * 1000; // 30 menit dalam milidetik
const minParticipants = 3;
const maxParticipants = 100;
const activeMoneykagets = new Map();

let handler = async (m, { usedPrefix }) => {
    let command = m.text.trim().split(' ');
    let user = m.sender;
    let chatId = m.chat;

    // Pastikan data pengguna ada
    if (!global.db.data.users[user]) {
        global.db.data.users[user] = {
            money: 0,
            lastMoneykaget: 0
        };
    }

    let userData = global.db.data.users[user];
    let currentTime = Date.now();

    // Cek apakah command menggunakan prefix atau tidak
    let moneykagetCommand = command[0].toLowerCase();
    if (moneykagetCommand === `${usedPrefix}moneykaget` || moneykagetCommand === 'moneykaget') {
        
        if (command.length === 1) {
            conn.reply(chatId, `⚠️ Gunakan: ${usedPrefix}moneykaget <jumlah uang> <jumlah penerima>. Contoh: ${usedPrefix}moneykaget 1000 5`, m);
            return;
        }

        // Pembuatan Moneykaget
        if (command[1] !== 'claim' && command[1] !== 'hapus' && command.length === 3) {
            let amount = parseInt(command[1]);
            let numParticipants = parseInt(command[2]);
            if (isNaN(amount) || isNaN(numParticipants) || numParticipants < minParticipants || numParticipants > maxParticipants) {
                conn.reply(chatId, `⚠️ Format salah! Gunakan ${usedPrefix}moneykaget <money> <jumlah pengguna>. Jumlah pengguna harus antara ${minParticipants} dan ${maxParticipants}.`, m);
                return;
            }

            if (userData.lastMoneykaget + moneykagetCooldown > currentTime) {
                let remainingTime = formatTime(userData.lastMoneykaget + moneykagetCooldown - currentTime);
                conn.reply(chatId, `⏳ Kamu @${user.split('@')[0]}, perlu menunggu ${remainingTime} sebelum bisa membuat moneykaget lagi.`, m, { mentions: [user] });
                return;
            }

            if (userData.money < amount) {
                conn.reply(chatId, `⚠️ Kamu tidak memiliki cukup money (${amount} money diperlukan) untuk membuat moneykaget ini.`, m, { mentions: [user] });
                return;
            }

            userData.money -= amount;
            let code = generateCode();
            activeMoneykagets.set(code, {
                creator: user,
                amount,
                numParticipants,
                claimed: [],
                createdAt: currentTime
            });
            userData.lastMoneykaget = currentTime;
            conn.reply(chatId, `💸 Moneykaget dibuat oleh @${user.split('@')[0]}!
- Code: ${code}
- Jumlah: ${numParticipants}
🔔 Ketik: ${usedPrefix}moneykaget claim <code>
🔕 Kadaluarsa dalam 30 menit`, m, { mentions: [user] });

            setTimeout(() => {
                if (activeMoneykagets.has(code)) {
                    let moneykaget = activeMoneykagets.get(code);
                    if (moneykaget.claimed.length < moneykaget.numParticipants) {
                        let remainingAmount = moneykaget.amount - calculateTotalClaimed(moneykaget.claimed, moneykaget.amount, moneykaget.numParticipants);
                        global.db.data.users[moneykaget.creator].money += remainingAmount;
                        conn.reply(chatId, `⏰ Moneykaget dengan code ${code} telah kedaluwarsa. Sisa uang ${remainingAmount} Money telah dikembalikan ke @${moneykaget.creator.split('@')[0]}.`, m, { mentions: [moneykaget.creator] });
                    }
                    activeMoneykagets.delete(code);
                }
            }, moneykagetCooldown);
        }

        // Klaim Moneykaget
        if (command[1] === 'claim' && command.length === 3) {
            let code = command[2].trim();
            if (!activeMoneykagets.has(code)) {
                conn.reply(chatId, `⚠️ Kode moneykaget tidak valid atau telah kedaluwarsa.`, m);
                return;
            }
            let moneykaget = activeMoneykagets.get(code);
            if (moneykaget.claimed.includes(user)) {
                conn.reply(chatId, `⚠️ Kamu sudah mengambil moneykaget ini.`, m, { mentions: [user] });
                return;
            }
            if (moneykaget.claimed.length >= moneykaget.numParticipants) {
                conn.reply(chatId, `⚠️ Semua moneykaget telah diambil.`, m);
                return;
            }

            let share = calculateShare(moneykaget.amount, moneykaget.claimed.length, moneykaget.numParticipants);
            userData.money += share;
            moneykaget.claimed.push(user);
            conn.reply(chatId, `🎉 @${user.split('@')[0]} telah menerima ${share} Money!`, m, { mentions: [user] });

            if (moneykaget.claimed.length === moneykaget.numParticipants) {
                conn.reply(chatId, `✅ Semua hadiah untuk moneykaget dengan code ${code} telah diambil.`, m);
                activeMoneykagets.delete(code);
            }
        }

        // Hapus Moneykaget
        if (command[1] === 'hapus' && command.length === 3) {
            let code = command[2].trim();
            if (!activeMoneykagets.has(code)) {
                conn.reply(chatId, `⚠️ Kode moneykaget tidak valid atau telah kedaluwarsa.`, m);
                return;
            }
            let moneykaget = activeMoneykagets.get(code);
            if (moneykaget.creator !== user) {
                conn.reply(chatId, `⚠️ Kamu tidak memiliki izin untuk menghapus moneykaget ini.`, m, { mentions: [user] });
                return;
            }
            let remainingAmount = moneykaget.amount - calculateTotalClaimed(moneykaget.claimed, moneykaget.amount, moneykaget.numParticipants);
            userData.money += remainingAmount;
            activeMoneykagets.delete(code);
            conn.reply(chatId, `🗑️ Moneykaget dengan code ${code} telah dihapus oleh @${user.split('@')[0]}. Sisa uang ${remainingAmount} Money telah dikembalikan.`, m, { mentions: [user] });
        }
    }
};

// Fungsi untuk format waktu dari milidetik ke HH:mm:ss
function formatTime(milliseconds) {
    let seconds = Math.floor(milliseconds / 1000);
    let hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    let minutes = Math.floor(seconds / 60);
    seconds %= 60;
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

// Fungsi untuk menambahkan nol di depan angka satu digit
function pad(number) {
    return (number < 10 ? '0' : '') + number;
}

// Fungsi untuk menghasilkan kode acak
function generateCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Fungsi untuk menghitung bagian uang yang diterima oleh setiap peserta
function calculateShare(totalAmount, claimedCount, totalParticipants) {
    const averageShare = totalAmount / totalParticipants;
    const bonusFactor = 1.2; // Klaim pertama mendapat 20% lebih banyak

    if (claimedCount === 0) {
        return Math.round(averageShare * bonusFactor);
    }

    const remainingAmount = totalAmount - (averageShare * bonusFactor);
    const remainingShares = totalParticipants - 1;
    const nextShare = remainingAmount / remainingShares;
    return Math.round(nextShare * (remainingShares - claimedCount) / remainingShares);
}

// Fungsi untuk menghitung total uang yang telah diklaim
function calculateTotalClaimed(claimedArray, totalAmount, totalParticipants) {
    let claimedAmount = 0;
    for (let i = 0; i < claimedArray.length; i++) {
        claimedAmount += calculateShare(totalAmount, i, totalParticipants);
    }
    return claimedAmount;
}

handler.help = ['moneykaget'];
handler.tags = ['game'];
handler.command = /^(\.?)moneykaget$/i; 
handler.group = true;
handler.register = true;

export default handler;
