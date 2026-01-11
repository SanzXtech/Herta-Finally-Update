let handler = async (m, { args }) => {
    let user = global.db.data.users[m.sender];
    let amount = parseFloat(args[0]);

    if (!amount || isNaN(amount) || amount <= 0) {
        return m.reply(`⚠️ Gunakan format: *setbuybtc <jumlah_btc>*\nContoh: *setbuybtc 0.0001*`);
    }

    user.buyAmount = amount;
    return m.reply(`✅ Nominal pembelian telah diatur ke ${amount} BTC.`);
};

handler.help = ['setbuybtc'];
handler.tags = ['crypto'];
handler.command = /^(setbuybtc)$/i;

export default handler;