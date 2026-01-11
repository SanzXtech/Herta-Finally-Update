import fetch from 'node-fetch';

const handler = async (m, { text }) => {
    const args = text.split(' ');

    // Daftar mata uang yang didukung
    const validCurrencies = [
        "USD", "IDR", "MYR", "EUR", "SGD", 
        "INR", "JPY", "AUD", "GBP"
    ];

    if (args.length < 2) {
        return m.reply(`Daftar Kode Mata Uang yang Didukung:\n${validCurrencies.join(', ')}\n\nGunakan format:\n.convert <jumlah> <dari mata uang>\nContoh: .convert 10 MYR`);
    }

    const [amount, fromCurrency] = args;

    // Validasi kode mata uang
    if (!validCurrencies.includes(fromCurrency)) {
        return m.reply(`Kode mata uang tidak valid. Gunakan salah satu dari kode berikut:\n${validCurrencies.join(', ')}`);
    }

    // Filter mata uang tujuan (kecuali mata uang asal)
    const targetCurrencies = validCurrencies.filter(currency => currency !== fromCurrency);

    // Hasil konversi
    let results = `Hasil Konversi ${amount} ${fromCurrency}:\n\n`;

    try {
        const apiUrl = `https://api.frankfurter.app/latest?from=${fromCurrency}&amount=${amount}`;
        const response = await fetch(apiUrl);

        if (!response.ok) throw new Error('Gagal mendapatkan data dari API.');

        const data = await response.json();
        const rates = data.rates;

        for (const toCurrency of targetCurrencies) {
            if (rates[toCurrency]) {
                const convertedAmount = rates[toCurrency].toFixed(2);
                results += `${toCurrency}: ${convertedAmount}\n`;
            }
        }

        m.reply(results.trim());
    } catch (error) {
        console.error(error);
        m.reply('Terjadi kesalahan saat menghubungi API.');
    }
};

handler.command = /^convert|cv$/i; // Perintah .convert
handler.help = ['convert <jumlah> <dari mata uang>'];
handler.tag = ['tools'];

export default handler;
