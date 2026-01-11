import fetch from 'node-fetch';
import fs from 'fs';

let btcMarketPrice = 1000000000; // Harga awal BTC dalam IDR
let previousPrice = btcMarketPrice;
const priceFluctuationRate = 0.01; // Maksimum fluktuasi 1%

// Riwayat harga BTC untuk grafik
let priceHistory = Array(10).fill(btcMarketPrice);

// Harga batas
const maxPrice = 1250000000;
const minPrice = 850000000;

// Fungsi update harga BTC
function updateMarketPrice() {
    let fluctuation = (Math.random() * (priceFluctuationRate * 2)) - priceFluctuationRate;
    previousPrice = btcMarketPrice;
    btcMarketPrice = Math.round(btcMarketPrice * (1 + fluctuation));
    btcMarketPrice = Math.max(minPrice, Math.min(btcMarketPrice, maxPrice));

    priceHistory.push(btcMarketPrice);
    if (priceHistory.length > 10) priceHistory.shift();
}

// Update harga setiap 5 menit
setInterval(updateMarketPrice, 5 * 60 * 1000);

function calculatePriceChange() {
    let priceChange = btcMarketPrice - previousPrice;
    let percentageChange = ((priceChange / previousPrice) * 100).toFixed(2);
    return { priceChange, percentageChange };
}

let handler = async (m, { conn, args, command }) => {
    let user = global.db.data.users[m.sender];
    let [cmd, amount] = args;
    amount = parseFloat(amount);

    let { priceChange, percentageChange } = calculatePriceChange();

    // Buat URL grafik harga BTC
    let chartUrl = `https://quickchart.io/chart?bkg=white&c=${encodeURIComponent(JSON.stringify({
        type: 'line',
        data: {
            labels: Array.from({ length: priceHistory.length }, (_, i) => `T${i + 1}`),
            datasets: [{
                label: 'Harga BTC (IDR)',
                data: priceHistory,
                borderColor: 'rgb(0, 123, 255)',
                backgroundColor: 'rgba(0, 123, 255, 0.1)',
                fill: true,
            }]
        },
        options: { scales: { y: { beginAtZero: false } }, plugins: { legend: { display: true } } }
    }))}`;

    let response = await fetch(chartUrl);
    if (!response.ok) return m.reply(`Gagal mengambil gambar grafik.`);
    let buffer = await response.buffer();
    fs.writeFileSync('/tmp/btc_chart.png', buffer);

    switch (cmd) {
        case 'buy':
    if (args[1] && args[1].toLowerCase() === 'all') {
        let maxBuyAmount = user.bank / btcMarketPrice;
        if (maxBuyAmount < 0.00000001) {
            return m.reply(`❌ Saldo tidak cukup untuk membeli BTC.`);
        }

        let totalPriceBuyAll = Math.round(btcMarketPrice * maxBuyAmount);
        user.bank -= totalPriceBuyAll;
        user.btc = (user.btc || 0) + maxBuyAmount;

        return m.reply(`✅ Kamu telah membeli ${maxBuyAmount.toFixed(8)} BTC seharga Rp${totalPriceBuyAll.toLocaleString()}.`);
    }

    let buyAmount = amount || user.buyAmount || 0.0001; // Prioritas args -> default setbuybtc
    let totalPriceBuy = Math.round(btcMarketPrice * buyAmount);

    if (user.bank < totalPriceBuy) {
        return m.reply(`❌ Saldo tidak cukup untuk membeli ${buyAmount} BTC.`);
    }

    user.bank -= totalPriceBuy;
    user.btc = (user.btc || 0) + buyAmount;
    return m.reply(`✅ Kamu telah membeli ${buyAmount} BTC seharga Rp${totalPriceBuy.toLocaleString()}.`);

case 'sell':
    if (args[1] && args[1].toLowerCase() === 'all') {
        if (!user.btc || user.btc <= 0) {
            return m.reply(`❌ Kamu tidak memiliki BTC untuk dijual.`);
        }

        let totalPriceSellAll = Math.round(btcMarketPrice * user.btc);
        let sellAllAmount = user.btc;

        user.btc = 0;
        user.bank += totalPriceSellAll;

        return m.reply(`✅ Kamu telah menjual ${sellAllAmount.toFixed(8)} BTC seharga Rp${totalPriceSellAll.toLocaleString()}.`);
    }

    let sellAmount = amount || user.buyAmount || 0.0001; // Prioritas args -> default setbuybtc
    if (user.btc < sellAmount) {
        return m.reply(`❌ Kamu tidak memiliki cukup BTC untuk menjual ${sellAmount} BTC.`);
    }

    let totalPriceSell = Math.round(btcMarketPrice * sellAmount);
    user.btc -= sellAmount;
    user.bank += totalPriceSell;
    return m.reply(`✅ Kamu telah menjual ${sellAmount} BTC seharga Rp${totalPriceSell.toLocaleString()}.`);
        
        case 'check':
            return m.reply(`💰 *Saldo BTC Kamu:* ${user.btc ? user.btc.toFixed(8) : '0.00000000'} BTC\n🏦 *Saldo Bank Kamu:* Rp${user.bank ? user.bank.toLocaleString() : '0'}`);
        
        case 'price':
            return m.reply(`
💸 *Harga BTC Saat Ini:* Rp${btcMarketPrice.toLocaleString()} per BTC
📉 *Harga Sebelumnya:* Rp${previousPrice.toLocaleString()}
📈 *Perubahan Harga:* Rp${priceChange.toLocaleString()} (${percentageChange}%)
            `);
        
        case 'setbuybtc':
            if (!amount || isNaN(amount) || amount <= 0) {
                return m.reply(`❌ Format salah! Gunakan: *${command} setbuybtc <jumlah>*\nContoh: *${command} setbuybtc 0.00001*`);
            }

            user.buyAmount = amount;
            return m.reply(`✅ Nominal pembelian BTC telah diatur ke ${amount} BTC.`);
        
        default:
            await conn.sendMessage(m.chat, {
                image: fs.readFileSync('/tmp/btc_chart.png'),
                caption: `
🌐 *Selamat datang di MarketBTC* 🌐

🪙 *Harga BTC Saat Ini:* Rp${btcMarketPrice.toLocaleString()}
📉 *Harga Sebelumnya:* Rp${previousPrice.toLocaleString()}
📈 *Perubahan Harga:* Rp${priceChange.toLocaleString()} (${percentageChange}%)

📈 *Harga Tertinggi BTC:* Rp${maxPrice.toLocaleString()}
📉 *Harga Terendah BTC:* Rp${minPrice.toLocaleString()}

🛍️ *!marketbtc buy* - Beli BTC dengan nominal yang telah diatur.
🛒 *!marketbtc sell* - Jual BTC dengan nominal yang telah diatur.
🔍 *!marketbtc check* - Cek saldo BTC dan bank kamu.
🏷️ *!marketbtc price* - Lihat harga BTC saat ini.
⚙️ *!marketbtc setbuybtc <jumlah>* - Atur nominal pembelian BTC.

🛒 *!marketbtc buy* - [Beli BTC]
💰 *!marketbtc sell* - [Jual BTC]

📝 *Contoh:* 
- Beli BTC: *!marketbtc buy*
- Jual BTC: *!marketbtc sell*
- Atur nominal beli: *!marketbtc setbuybtc 0.00001*
                `,
                buttons: [
                    { buttonId: '!marketbtc buy', buttonText: { displayText: '🛒 Beli BTC' }, type: 1 },
                    { buttonId: '!marketbtc sell', buttonText: { displayText: '💰 Jual BTC' }, type: 1 }
                ],
                headerType: 4
            });
    }
};

handler.help = ['marketbtc'];
handler.tags = ['rpg', 'crypto'];
handler.command = /^(marketbtc)$/i;
handler.rpg = true;
handler.group = true;
handler.register = true;

export default handler;
