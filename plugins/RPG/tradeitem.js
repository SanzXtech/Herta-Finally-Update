let confirmation = {}; // Store trade session confirmations

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!conn.trade) conn.trade = {}; // Initialize if there's no trade session
  let user = global.db.data.users[m.sender];
  let target = conn.trade[m.sender];

  if (!target) return m.reply("Kamu tidak sedang dalam sesi trade!");

  let itemName = (args[0] || "").toLowerCase(); // Name of the item being traded
  let itemCount = parseInt(args[1]) || 1; // Quantity of the item
  let itemPrice = parseInt(args[2]) || 0; // Price of the item

  if (!itemName || !itemCount || !itemPrice)
    return m.reply(`*❗Gunakan format:*\n${usedPrefix}${command} namaItem jumlahItem hargaItem\n*❗Example:*\n${usedPrefix}${command} sword 1 100000`);

  if (user[itemName] < itemCount)
    return m.reply(`Kamu tidak punya cukup ${itemName} untuk di-trade!`);

  let tradeMessage = `@${m.sender.replace(/@s\.whatsapp\.net/g, "")} menawarkan ${itemCount} ${itemName} seharga ${itemPrice} uang. Apakah kamu ingin membelinya?\n\n✅ (Yes) ❌ (No)`;

  // Send trade offer to the group
  let chatId = m.chat; // Chat ID where trade is happening
  let { key } = await conn.reply(chatId, tradeMessage, m, { mentions: [m.sender, target] });

  // Store the trade offer
  confirmation[target] = {
    sender: m.sender,
    itemName,
    itemCount,
    itemPrice,
    key,
    chatId, // Save chat ID
    timeout: setTimeout(() => {
      conn.sendMessage(chatId, { delete: key });
      delete confirmation[target];
      delete conn.trade[m.sender];
    }, 60 * 1000) // Delete offer after 60 seconds
  };
};

handler.help = ["tradeitem <namaItem> <jumlahItem> <hargaItem>"];
handler.tags = ["rpg"];
handler.command = /^(tradeitem)$/i;
handler.group = true;
handler.rpg = true;
handler.register = true;
export default handler;

// Handle confirmation
handler.before = async m => {
  if (m.isBaileys) return;
  if (!m.text) return;

  for (let target in confirmation) {
    let { sender, itemName, itemCount, itemPrice, key, chatId } = confirmation[target];

    if (m.sender === target) {
      let pembeli = global.db.data.users[m.sender];
      let penjual = global.db.data.users[sender];

      // Check if the buyer has enough money again
      if (/(✔️|y(es)?)/i.test(m.text.toLowerCase())) {
        if (pembeli.money < itemPrice)
          return conn.reply(m.sender, "Kamu tidak punya cukup uang untuk membeli item ini!");

        // Re-check seller's item availability before proceeding
        if (penjual[itemName.toLowerCase()] < itemCount)
          return conn.reply(chatId, "Penjual tidak punya cukup item lagi untuk trade!");

        // Complete the trade
        pembeli.money -= itemPrice; // Deduct money from buyer
        penjual.money += itemPrice; // Add money to seller

        // Adjust item counts for both users based on the trade
        if (penjual[itemName] >= itemCount) {
          penjual[itemName] -= itemCount;
          pembeli[itemName] = pembeli[itemName] || 0; // Initialize if undefined
          pembeli[itemName] += itemCount;
        }

        // Send messages to both users
        conn.reply(chatId, `Kamu membeli ${itemCount} ${itemName} seharga ${itemPrice} uang dari @${sender.replace(/@s\.whatsapp\.net/g, "")}.`, null, { mentions: [sender] });
        conn.reply(chatId, `Item ${itemCount} ${itemName} kamu terjual seharga ${itemPrice} uang.`, null, { mentions: [m.sender] });

        // Clear the trade offer and session after the transaction is complete
        clearTimeout(confirmation[target].timeout);
        delete confirmation[target];
        delete conn.trade[sender];
        delete conn.trade[m.sender];
      } else if (/(✖️|n(o)?)/i.test(m.text.toLowerCase())) {
        conn.reply(chatId, `Trade dibatalkan oleh @${m.sender.replace(/@s\.whatsapp\.net/g, "")}.`, null, { mentions: [m.sender] });
        conn.reply(m.sender, "Kamu telah membatalkan trade.", null);

        // Clear the trade offer and session if canceled
        clearTimeout(confirmation[target].timeout);
        delete confirmation[target];
        delete conn.trade[sender];
        delete conn.trade[m.sender];
      }
    }
  }
};
