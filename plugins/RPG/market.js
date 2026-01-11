import { readFileSync } from 'fs';
import moment from 'moment-timezone';

// Function untuk membuat thumbnail
function thumbnail(url) {
    return url || 'https://files.catbox.moe/kiycz0.jpg';
}

// Function untuk membuat fake contact
function fkontak(conn, m) {
    return {
        key: {
            participant: '0@s.whatsapp.net',
            remoteJid: 'status@broadcast',
            fromMe: false,
            id: 'Halo'
        },
        message: {
            contactMessage: {
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
            }
        },
        participant: '0@s.whatsapp.net'
    };
}

// Fungsi untuk mengecek jam trading
function isTradingHours() {
    const now = moment().tz('Asia/Jakarta');
    const currentHour = now.hour();
    const currentMinute = now.minute();
    const dayOfWeek = now.day(); // 0 = Sunday, 6 = Saturday
    
    // Trading hours: Senin-Jumat 09:00-15:30 WIB
    const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
    
    // Cek apakah waktu sudah lewat jam 9:00
    const afterOpen = currentHour > 9 || (currentHour === 9 && currentMinute >= 0);
    // Cek apakah waktu sebelum jam 15:30
    const beforeClose = currentHour < 15 || (currentHour === 15 && currentMinute <= 30);
    
    return isWeekday && afterOpen && beforeClose;
}

// Fungsi untuk menghitung biaya trading
function calculateTradingFees(totalAmount, action) {
    const fees = {};
    
    if (action === 'beli') {
        // Broker fee untuk beli: 0.15% - 0.3%
        fees.brokerFee = Math.round(totalAmount * 0.0015); // 0.15%
        fees.adminFee = 5000; // Biaya administrasi flat
        fees.totalFees = fees.brokerFee + fees.adminFee;
        fees.totalCost = totalAmount + fees.totalFees;
    } else if (action === 'jual') {
        // Broker fee untuk jual: 0.25%
        fees.brokerFee = Math.round(totalAmount * 0.0025); // 0.25%
        // Pajak untuk jual: 0.1%
        fees.tax = Math.round(totalAmount * 0.001); // 0.1%
        fees.adminFee = 5000; // Biaya administrasi flat
        fees.totalFees = fees.brokerFee + fees.tax + fees.adminFee;
        fees.netAmount = totalAmount - fees.totalFees;
    }
    
    return fees;
}

// Fungsi untuk format waktu trading
function getTradingTimeInfo() {
    const now = moment().tz('Asia/Jakarta');
    const isOpen = isTradingHours();
    const dayOfWeek = now.day();
    
    if (isOpen) {
        const closeTime = moment().tz('Asia/Jakarta').hour(15).minute(30).second(0);
        const timeToClose = moment.duration(closeTime.diff(now));
        return {
            status: '🟢 MARKET BUKA',
            info: `Tutup dalam ${timeToClose.hours()}j ${timeToClose.minutes()}m`,
            canTrade: true
        };
    } else {
        let nextOpen = moment().tz('Asia/Jakarta');
        
        // Jika hari weekday tapi belum jam 9:00, buka hari ini jam 9:00
        if (dayOfWeek >= 1 && dayOfWeek <= 5 && now.hour() < 9) {
            nextOpen.hour(9).minute(0).second(0);
        }
        // Jika hari weekday tapi sudah lewat jam 15:30, buka besok jam 9:00
        else if (dayOfWeek >= 1 && dayOfWeek <= 4) { // Senin-Kamis
            nextOpen.add(1, 'day').hour(9).minute(0).second(0);
        }
        // Jika hari Jumat dan sudah tutup, buka Senin
        else if (dayOfWeek === 5) {
            nextOpen.add(3, 'days').hour(9).minute(0).second(0); // Loncat ke Senin
        }
        // Jika weekend (Sabtu)
        else if (dayOfWeek === 6) {
            nextOpen.add(2, 'days').hour(9).minute(0).second(0); // Loncat ke Senin
        }
        // Jika weekend (Minggu)
        else if (dayOfWeek === 0) {
            nextOpen.add(1, 'day').hour(9).minute(0).second(0); // Loncat ke Senin
        }
        
        return {
            status: '🔴 MARKET TUTUP',
            info: `Buka: ${nextOpen.format('dddd, DD/MM HH:mm')} WIB`,
            canTrade: false
        };
    }
}

// Fungsi untuk mengupdate harga saham secara periodik
function updateStockPrices() {
    const settings = global.db.data.settings["settingbot"];

    setInterval(() => {
        // Hanya update saat jam trading
        if (!isTradingHours()) return;
        
        // Update harga dengan fluktuasi random ±5%
        const fluctuation = () => (Math.random() * 0.1) - 0.05; // -5% to +5%

        if (settings.bbcaPrice) {
            settings.bbcaPrice = Math.max(1000, Math.round(settings.bbcaPrice * (1 + fluctuation())));
        }
        if (settings.bbriPrice) {
            settings.bbriPrice = Math.max(1000, Math.round(settings.bbriPrice * (1 + fluctuation())));
        }
        if (settings.bbniPrice) {
            settings.bbniPrice = Math.max(1000, Math.round(settings.bbniPrice * (1 + fluctuation())));
        }
        if (settings.brisPrice) {
            settings.brisPrice = Math.max(1000, Math.round(settings.brisPrice * (1 + fluctuation())));
        }
    }, 15 * 60 * 1000); // Update setiap 15 menit
}

// Mulai update harga otomatis
updateStockPrices();

async function handler(m, { conn, command, args, usedPrefix }) {
    const user = global.db.data.users[m.sender];
    const settings = global.db.data.settings["settingbot"];

    // Inisialisasi harga saham jika belum ada
    if (!("bbcaNormalPrice" in settings)) settings.bbcaNormalPrice = 10150;
    if (!("bbriNormalPrice" in settings)) settings.bbriNormalPrice = 4750;
    if (!("bbniNormalPrice" in settings)) settings.bbniNormalPrice = 6075;
    if (!("brisNormalPrice" in settings)) settings.brisNormalPrice = 2894;

    // Set harga current jika belum ada
    if (!("bbcaPrice" in settings)) settings.bbcaPrice = settings.bbcaNormalPrice;
    if (!("bbriPrice" in settings)) settings.bbriPrice = settings.bbriNormalPrice;
    if (!("bbniPrice" in settings)) settings.bbniPrice = settings.bbniNormalPrice;
    if (!("brisPrice" in settings)) settings.brisPrice = settings.brisNormalPrice;

    // Inisialisasi data user
    if (!user.money) user.money = 0;
    if (!user.totalInvestasi) user.totalInvestasi = 0;
    if (!user.totalInvestasiSekarang) user.totalInvestasiSekarang = 0;

    const action = args[0]?.toLowerCase();
    const stock = args[1]?.toLowerCase();
    const amount = parseInt(args[2]) || 1;

    // Get trading time info
    const tradingInfo = getTradingTimeInfo();

    // Fungsi untuk menghitung status naik/turun
    const calculateStatus = (price, normalPrice) => {
        const diffPercent = ((price - normalPrice) / normalPrice * 100).toFixed(2);
        const status = price > normalPrice ? `📈 Naik (+${diffPercent}%)` : `📉 Turun (${diffPercent}%)`;
        return { status, emoji: price > normalPrice ? "📈" : "📉", diffPercent: parseFloat(diffPercent) };
    };

    // Data saham yang tersedia
    const stocks = {
        bbca: { name: 'Bank Central Asia', code: 'BBCA', priceKey: 'bbcaPrice', normalKey: 'bbcaNormalPrice' },
        bbri: { name: 'Bank Rakyat Indonesia', code: 'BBRI', priceKey: 'bbriPrice', normalKey: 'bbriNormalPrice' },
        bbni: { name: 'Bank Negara Indonesia', code: 'BBNI', priceKey: 'bbniPrice', normalKey: 'bbniNormalPrice' },
        bris: { name: 'Bank Syariah Indonesia', code: 'BRIS', priceKey: 'brisPrice', normalKey: 'brisNormalPrice' }
    };

    if (!action) {
        // Menu market utama dengan harga saham
        const currentTime = moment().tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm:ss');
        let priceList = `📈 *MARKET SAHAM REAL-TIME*\n`;
        priceList += `🕐 ${currentTime} WIB\n`;
        priceList += `${tradingInfo.status} | ${tradingInfo.info}\n\n`;

        for (const [key, stockData] of Object.entries(stocks)) {
            const currentPrice = settings[stockData.priceKey];
            const normalPrice = settings[stockData.normalKey];
            const { status, emoji } = calculateStatus(currentPrice, normalPrice);

            priceList += `🏢 *${stockData.code}* (${stockData.name})\n`;
            priceList += `💰 ${currentPrice.toLocaleString()}/lembar ${emoji}\n`;
            priceList += `📦 ${(currentPrice * 100).toLocaleString()}/lot\n`;
            priceList += `📊 ${status}\n\n`;
        }

        priceList += `\n📋 *BIAYA TRADING:*\n`;
        priceList += `• Broker Fee Beli: 0.15%\n`;
        priceList += `• Broker Fee Jual: 0.25%\n`;
        priceList += `• Pajak Jual: 0.1%\n`;
        priceList += `• Admin Fee: Rp 5.000\n\n`;
        
        priceList += `🛒 *CARA TRADING:*\n`;
        priceList += `• ${usedPrefix}market beli [kode] [lot]\n`;
        priceList += `• ${usedPrefix}market jual [kode] [lot]\n`;
        priceList += `\n💡 *Contoh:* ${usedPrefix}market beli bbca 5`;

        conn.sendMessage(m.chat, {
            document: readFileSync('./package.json'),
            mimetype: 'application/pdf',
            fileName: `Market Saham Real-Time`,
            fileLength: "999999999999",
            caption: priceList,
            footer: `Market Trading || Herta Bot`,
            buttons: [
                {
                    buttonId: `!portofolio`,
                    buttonText: { displayText: '💼 Lihat Portofolio' },
                    type: 1
                },
                {
                    buttonId: `!saham`,
                    buttonText: { displayText: '📚 Tutorial Trading' },
                    type: 1
                },
                {
                    buttonId: 'trading_action',
                    buttonText: { displayText: tradingInfo.canTrade ? 'TRADING SAHAM' : 'MARKET TUTUP' },
                    type: 4,
                    nativeFlowInfo: {
                        name: 'single_select',
                        paramsJson: JSON.stringify({
                            title: 'TRADING SAHAM',
                            sections: [
                                {
                                    title: 'Market Buy',
                                    highlight_label: 'Beli',
                                    rows: [
                                        {
                                            header: 'BBCA',
                                            title: 'Bank Central Asia',
                                            description: `> Beli saham BBCA - Harga: ${settings.bbcaPrice.toLocaleString()}/lembar`,
                                            id: `!market beli bbca 1`,
                                        },
                                        {
                                            header: 'BBRI',
                                            title: 'Bank Rakyat Indonesia',
                                            description: `> Beli saham BBRI - Harga: ${settings.bbriPrice.toLocaleString()}/lembar`,
                                            id: `!market beli bbri 1`,
                                        },
                                        {
                                            header: 'BBNI',
                                            title: 'Bank Negara Indonesia',
                                            description: `> Beli saham BBNI - Harga: ${settings.bbniPrice.toLocaleString()}/lembar`,
                                            id: `!market beli bbni 1`,
                                        },
                                        {
                                            header: 'BRIS',
                                            title: 'Bank Syariah Indonesia',
                                            description: `> Beli saham BRIS - Harga: ${settings.brisPrice.toLocaleString()}/lembar`,
                                            id: `!market beli bris 1`,
                                        },
                                    ],
                                },
                                {
                                    title: 'Market Sell',
                                    highlight_label: 'Jual',
                                    rows: [
                                        {
                                            header: 'BBCA',
                                            title: 'Bank Central Asia',
                                            description: `> Jual saham BBCA - Harga: ${settings.bbcaPrice.toLocaleString()}/lembar`,
                                            id: `!market jual bbca 1`,
                                        },
                                        {
                                            header: 'BBRI',
                                            title: 'Bank Rakyat Indonesia',
                                            description: `> Jual saham BBRI - Harga: ${settings.bbriPrice.toLocaleString()}/lembar`,
                                            id: `!market jual bbri 1`,
                                        },
                                        {
                                            header: 'BBNI',
                                            title: 'Bank Negara Indonesia',
                                            description: `> Jual saham BBNI - Harga: ${settings.bbniPrice.toLocaleString()}/lembar`,
                                            id: `!market jual bbni 1`,
                                        },
                                        {
                                            header: 'BRIS',
                                            title: 'Bank Syariah Indonesia',
                                            description: `> Jual saham BRIS - Harga: ${settings.brisPrice.toLocaleString()}/lembar`,
                                            id: `!market jual bris 1`,
                                        },
                                    ],
                                },
                            ],
                        }),
                    },
                },
            ],
            headerType: 1,
            viewOnce: true,
            contextInfo: {
                externalAdReply: {
                    title: 'Market Saham Real-Time',
                    body: `${tradingInfo.status} - ${tradingInfo.info}`,
                    thumbnailUrl: thumbnail('https://files.catbox.moe/kiycz0.jpg'),
                    sourceUrl: 'https://whatsapp.com/channel/0029VafEhDUIXnlyGgMSgH2u',
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: fkontak(conn, m) });
        return;
    }

    // Cek jam trading untuk transaksi
    if (!tradingInfo.canTrade && (action === 'beli' || action === 'jual')) {
        return conn.reply(m.chat, `⏰ *MARKET TUTUP*\n\n${tradingInfo.status}\n${tradingInfo.info}\n\n📅 Jam Trading: Senin-Jumat 09:00-15:30 WIB`, fkontak(conn, m));
    }

    switch (action) {
        case 'beli':
            if (!stock || !stocks[stock]) {
                return conn.reply(m.chat, '📛 Kode saham tidak valid. Gunakan: bbca, bbri, bbni, atau bris', fkontak(conn, m));
            }

            const stockInfo = stocks[stock];
            const stockPrice = settings[stockInfo.priceKey];
            const totalAmount = stockPrice * amount * 100; // 1 lot = 100 lembar
            const fees = calculateTradingFees(totalAmount, 'beli');

            if (user.money < fees.totalCost) {
                return conn.reply(m.chat, `💸 *UANG TIDAK CUKUP!*\n\n📊 Rincian Biaya:\n💰 Nilai Saham: ${totalAmount.toLocaleString()}\n🏦 Broker Fee (0.15%): ${fees.brokerFee.toLocaleString()}\n📋 Admin Fee: ${fees.adminFee.toLocaleString()}\n💳 Total Bayar: ${fees.totalCost.toLocaleString()}\n\n💵 Uang Anda: ${user.money.toLocaleString()}\n❌ Kurang: ${(fees.totalCost - user.money).toLocaleString()}`, fkontak(conn, m));
            }

            // Proses pembelian
            user.money -= fees.totalCost;
            user[stock] = (user[stock] || 0) + 1;
            user[`${stock}LembarSaham`] = (user[`${stock}LembarSaham`] || 0) + (amount * 100);
            user[`${stock}Investasi`] = (user[`${stock}Investasi`] || 0) + fees.totalCost;
            user[`${stock}InvestasiSekarang`] = (user[`${stock}InvestasiSekarang`] || 0) + totalAmount;
            user.totalInvestasi += fees.totalCost;
            user.totalInvestasiSekarang += totalAmount;

            return conn.reply(m.chat, `🛒 *MARKET BUY BERHASIL!*\n\n📊 Saham: ${stockInfo.name} (${stockInfo.code})\n📦 Lot: ${amount} | 📈 Lembar: ${amount * 100}\n💰 Harga: ${stockPrice.toLocaleString()}/lembar\n\n💳 *RINCIAN BIAYA:*\n💰 Nilai Saham: ${totalAmount.toLocaleString()}\n🏦 Broker Fee (0.15%): ${fees.brokerFee.toLocaleString()}\n📋 Admin Fee: ${fees.adminFee.toLocaleString()}\n💳 Total Bayar: ${fees.totalCost.toLocaleString()}\n\n💵 Sisa Uang: ${user.money.toLocaleString()}`, fkontak(conn, m));

        case 'jual':
            if (!stock || !stocks[stock]) {
                return conn.reply(m.chat, '📛 Kode saham tidak valid. Gunakan: bbca, bbri, bbni, atau bris', fkontak(conn, m));
            }

            if (!user[stock] || user[`${stock}LembarSaham`] < (amount * 100)) {
                return conn.reply(m.chat, `⛔ Anda tidak memiliki cukup saham ${stocks[stock].code}!\n\nDibutuhkan: ${amount * 100} lembar\nYang dimiliki: ${user[`${stock}LembarSaham`] || 0} lembar`, fkontak(conn, m));
            }

            const sellStockInfo = stocks[stock];
            const sellPrice = settings[sellStockInfo.priceKey];
            const totalSellAmount = sellPrice * amount * 100;
            const sellFees = calculateTradingFees(totalSellAmount, 'jual');

            // Proses penjualan
            user.money += sellFees.netAmount;
            user[`${stock}LembarSaham`] -= (amount * 100);
            user[`${stock}InvestasiSekarang`] = user[`${stock}LembarSaham`] * sellPrice;

            // Jika semua saham terjual
            if (user[`${stock}LembarSaham`] <= 0) {
                user[stock] = 0;
                user[`${stock}LembarSaham`] = 0;
                user[`${stock}Investasi`] = 0;
                user[`${stock}InvestasiSekarang`] = 0;
            }

            return conn.reply(m.chat, `💵 *MARKET SELL BERHASIL!*\n\n📊 Saham: ${sellStockInfo.name} (${sellStockInfo.code})\n📦 Lot: ${amount} | 📈 Lembar: ${amount * 100}\n💰 Harga: ${sellPrice.toLocaleString()}/lembar\n\n💳 *RINCIAN BIAYA:*\n💰 Nilai Jual: ${totalSellAmount.toLocaleString()}\n🏦 Broker Fee (0.25%): ${sellFees.brokerFee.toLocaleString()}\n🏛️ Pajak (0.1%): ${sellFees.tax.toLocaleString()}\n📋 Admin Fee: ${sellFees.adminFee.toLocaleString()}\n💸 Total Biaya: ${sellFees.totalFees.toLocaleString()}\n💵 Diterima: ${sellFees.netAmount.toLocaleString()}\n\n💵 Total Uang: ${user.money.toLocaleString()}`, fkontak(conn, m));

        default:
            return conn.reply(m.chat, `❌ Aksi tidak valid. Gunakan: beli atau jual\n\nContoh:\n• ${usedPrefix}market beli bbca 5\n• ${usedPrefix}market jual bbri 3`, fkontak(conn, m));
    }
}

// Properti untuk membantu handler
handler.help = ['market'];
handler.tags = ['finance'];
handler.command = /^market$/i;

export default handler;