const freeWinRate = 25; // Free users' base win rate (15%)
const premiumWinRate = 45; // Premium users' base win rate (35%)
const maxTanoBonus = 10; // Maximum bonus win rate from having 10 or more tano pets

export const handler = async (m, { text }) => {
    const user = global.db.data.users[m.sender];
    const isPremium = user.premium || false;
    const betAmount = parseInt(text);
    const tanoCount = user.tano || 0;

    if (!betAmount || isNaN(betAmount) || betAmount <= 0) {
        return m.reply(
            "🎰 How to Play Slot Machine 🎰\n" +
            "Type: *.slot <bet_amount>*\n" +
            "Example: *.slot 1000*\n\n" +
            "💡 Minimum bet: Rp.1,000"
        );
    }

    if (user.money < betAmount) {
        return m.reply("❌ Your balance is insufficient for this bet.");
    }

    user.money -= betAmount;

    let winRate = isPremium ? premiumWinRate : freeWinRate;
    if (tanoCount >= 10) {
        winRate += maxTanoBonus;
    }

    const symbols = ["🍒", "🍋", "🍉", "⭐", "💎"];
    let slotResults = Array(9).fill().map(() => symbols[Math.floor(Math.random() * symbols.length)]);

    const formatCurrency = (amount) => `Rp.${amount.toLocaleString("id-ID")}`;

    let message = `🎰 Slot Machine 🎰\n\n`;

    // Display slot results in a 3x3 grid with an arrow pointing to the evaluated row
    message += `${slotResults[0]} | ${slotResults[1]} | ${slotResults[2]}\n`;
    message += `${slotResults[3]} | ${slotResults[4]} | ${slotResults[5]} <=\n`;
    message += `${slotResults[6]} | ${slotResults[7]} | ${slotResults[8]}\n\n`;

    let prize = 0;

    // Check for winning conditions based on slot results in columns 4, 5, and 6
    if (slotResults[3] === slotResults[4] && slotResults[4] === slotResults[5]) {
        // Jackpot - all three symbols in middle row (4, 5, 6) match
        prize = betAmount * 5;
        user.money += prize;
        message += `✨ *JACKPOT!!!* Congratulations! You won ${formatCurrency(prize)}! ✨`;
    } else if (slotResults[3] === slotResults[4]) {
        // Small win - two symbols in middle row (4, 5) match
        prize = betAmount * 2;
        user.money += prize;
        message += `🥳 *WIN!!!* Congratulations! You won ${formatCurrency(prize)}! 🥳`;
    } else {
        message += `You *Lose*, Nice Try`;
    }

    m.reply(message);
};

handler.help = ['slot <bet>'];
handler.tags = ['game'];
handler.command = /^slot$/;
handler.game = true;

export default handler;
