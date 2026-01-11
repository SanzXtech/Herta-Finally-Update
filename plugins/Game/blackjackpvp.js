const items = ["money", "chip", "diamond", "bank", "emerald", "gold"];

async function handler(m, { conn, usedPrefix, command, text }) {
conn.blackjack2 = conn.blackjack2 ? conn.blackjack2 : {};

let args = text ? text.split(' ') : [];
let subCommand = args[0] ? args[0].toLowerCase() : '';

// Helper functions
let cards = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
let suits = ["♠", "♥", "♦", "♣"];

let calculateTotal = (cardArray) => {
let total = 0;
let aces = 0;

for (let card of cardArray) {
let value = card.replace(/[♠♥♦♣]/g, '');
if (value === "A") {
total += 11;
aces++;
} else if (value === "K" || value === "Q" || value === "J") {
total += 10;
} else {
total += parseInt(value);
}
}

while (aces > 0 && total > 21) {
total -= 10;
aces--;
}

return total;

};

let pickCard = () => {
let card = cards[Math.floor(Math.random() * cards.length)];
let suit = suits[Math.floor(Math.random() * suits.length)];
return card + suit;
};

let pickLowCard = () => {
let lowCards = ["A", "2", "3", "4", "5", "6", "7", "8", "9"];
let card = lowCards[Math.floor(Math.random() * lowCards.length)];
let suit = suits[Math.floor(Math.random() * suits.length)];
return card + suit;
};

let getCardValue = (card) => {
return card.replace(/[♠♥♦♣]/g, '');
};

let isBlackjack = (cards) => {
if (cards.length !== 2) return false;
let values = cards.map(card => getCardValue(card));
return (values.includes("A") && (values.includes("10") || values.includes("J") || values.includes("Q") || values.includes("K")));
};

let generateRoomId = () => {
return "#BJ" + Math.random().toString(36).substr(2, 3).toUpperCase();
};

let findUserRoom = (userId) => {
for (let roomId in conn.blackjack2) {
if (conn.blackjack2[roomId].players.some(p => p.id === userId)) {
return roomId;
}
}
return null;
};

let getUserName = (userId) => {
return userId.split('@')[0];
};

// Tutorial/Help
if (!text || subCommand === 'help') {
return conn.reply(m.chat, `🎰 BLACKJACK PVP TUTORIAL 🎰

Room Commands:
• ${usedPrefix}blackjackpvp create - Create new room
• ${usedPrefix}blackjackpvp join - Join existing room
• ${usedPrefix}blackjackpvp leave - Leave current room
• ${usedPrefix}blackjackpvp delete - Delete room (creator only)
• ${usedPrefix}blackjackpvp bet <item> <amount> - Set bet (creator only)
• ${usedPrefix}blackjackpvp start - Start game (creator only)

In-Game Commands:
• hit - Take another card
• stand - End your turn
• double - Double bet + 1 card only

Rules:
• 2-8 players max
• All players use same bet amount
• Turn-based gameplay
• Standard blackjack rules apply
• Creator controls room settings

Example:
${usedPrefix}blackjackpvp create
${usedPrefix}blackjackpvp bet chip 5000
${usedPrefix}blackjackpvp start`, m, {
contextInfo: {
externalAdReply: {
title: "🎰 BLACKJACK PVP",
body: "Multiplayer Casino Game",
thumbnailUrl: "https://telegra.ph/file/1703cff0a758d0ef8f84f.png",
sourceUrl: "",
mediaType: 1,
renderLargerThumbnail: true,
},
},
});
}

// Create Room
if (subCommand === 'create') {
let existingRoom = findUserRoom(m.sender);
if (existingRoom) {
return m.reply("❌ You are already in a room! Leave first with blackjackpvp leave");
}

let roomId = generateRoomId();
conn.blackjack2[roomId] = {
id: roomId,
creator: m.sender,
players: [{ id: m.sender, name: getUserName(m.sender) }],
betType: 'chip',
betAmount: 1000,
status: 'waiting',
gameData: null,
chatId: m.chat
};

return conn.reply(m.chat, `🎰 BLACKJACK PVP ROOM CREATED 🎰

╭─ 🏠 ROOM INFO
│ Room ID: ${roomId}
│ Creator: @${getUserName(m.sender)}
│ Players: 1/8
├─ 💰 BET SETTINGS
│ Type: chip
│ Amount: 1000
├─ 📊 STATUS
│ Status: Waiting for players
╰─ ⚙️ CONTROLS

Commands:
• blackjackpvp bet <item> <amount> - Change bet
• blackjackpvp start - Start game (min 2 players)
• blackjackpvp delete - Delete room

Others can join with: blackjackpvp join`, m, {
mentions: [m.sender],
contextInfo: {
externalAdReply: {
title: "🎰 BLACKJACK PVP",
body: "Room Created",
thumbnailUrl: "https://telegra.ph/file/1703cff0a758d0ef8f84f.png",
sourceUrl: "",
mediaType: 1,
renderLargerThumbnail: true,
},
},
});
}

// Join Room
if (subCommand === 'join') {
let existingRoom = findUserRoom(m.sender);
if (existingRoom) {
return m.reply("❌ You are already in a room! Leave first with blackjackpvp leave");
}

let availableRooms = Object.values(conn.blackjack2).filter(room =>
room.chatId === m.chat &&
room.status === 'waiting' &&
room.players.length < 8
);

if (availableRooms.length === 0) {
return m.reply("❌ No available rooms in this chat. Create one with blackjackpvp create");
}

let room = availableRooms[0];
room.players.push({ id: m.sender, name: getUserName(m.sender) });

let playersList = room.players.map(p => `@${p.name}`).join(', ');

return conn.reply(m.chat, `🎰 JOINED BLACKJACK ROOM 🎰

╭─ 🏠 ROOM INFO
│ Room ID: ${room.id}
│ Creator: @${getUserName(room.creator)}
│ Players: ${room.players.length}/8
├─ 👥 PLAYER LIST
│ ${playersList}
├─ 💰 BET SETTINGS
│ Type: ${room.betType}
│ Amount: ${room.betAmount}
╰─ 📊 STATUS

Status: Waiting for creator to start
Min players: 2`, m, {
mentions: room.players.map(p => p.id),
contextInfo: {
externalAdReply: {
title: "🎰 BLACKJACK PVP",
body: "Joined Room",
thumbnailUrl: "https://telegra.ph/file/1703cff0a758d0ef8f84f.png",
sourceUrl: "",
mediaType: 1,
renderLargerThumbnail: true,
},
},
});
}

// Leave Room
if (subCommand === 'leave') {
let roomId = findUserRoom(m.sender);
if (!roomId) {
return m.reply("❌ You are not in any room");
}

let room = conn.blackjack2[roomId];
room.players = room.players.filter(p => p.id !== m.sender);

if (room.players.length === 0 || room.creator === m.sender) {
delete conn.blackjack2[roomId];
return m.reply("✅ Left room and room deleted");
}

// Transfer creator if needed
if (room.creator === m.sender) {
room.creator = room.players[0].id;
}

return m.reply("✅ Left the room successfully");

}

// Delete Room
if (subCommand === 'delete') {
let roomId = findUserRoom(m.sender);
if (!roomId) {
return m.reply("❌ You are not in any room");
}

let room = conn.blackjack2[roomId];
if (room.creator !== m.sender) {
return m.reply("❌ Only room creator can delete the room");
}

delete conn.blackjack2[roomId];
return m.reply("✅ Room deleted successfully");

}

// Set Bet
if (subCommand === 'bet') {
let roomId = findUserRoom(m.sender);
if (!roomId) {
return m.reply("❌ You are not in any room");
}

let room = conn.blackjack2[roomId];
if (room.creator !== m.sender) {
return m.reply("❌ Only room creator can change bet settings");
}

if (room.status !== 'waiting') {
return m.reply("❌ Cannot change bet during game");
}

let [, type, amountText] = args;
if (!type || !amountText) {
return m.reply(`*Example:* ${usedPrefix}blackjackpvp bet chip 5000`);
}

type = type.toLowerCase();
if (!items.includes(type)) {
return m.reply(`*Available items:* ${items.join(', ')}`);
}

let amount = parseInt(amountText);
if (isNaN(amount) || amount <= 0) {
return m.reply("❌ Invalid bet amount");
}

room.betType = type;
room.betAmount = amount;

return conn.reply(m.chat, `🎰 BET UPDATED 🎰

╭─ 💰 NEW BET SETTINGS
│ Type: ${type}
│ Amount: ${amount}
├─ 🏠 ROOM INFO
│ Room ID: ${room.id}
│ Players: ${room.players.length}/8
╰─ ⚙️ READY TO START

Use blackjackpvp start to begin the game`, m, {
contextInfo: {
externalAdReply: {
title: "🎰 BLACKJACK PVP",
body: "Bet Updated",
thumbnailUrl: "https://telegra.ph/file/1703cff0a758d0ef8f84f.png",
sourceUrl: "",
mediaType: 1,
renderLargerThumbnail: true,
},
},
});
}

// Start Game
if (subCommand === 'start') {
let roomId = findUserRoom(m.sender);
if (!roomId) {
return m.reply("❌ You are not in any room");
}

let room = conn.blackjack2[roomId];
if (room.creator !== m.sender) {
return m.reply("❌ Only room creator can start the game");
}

if (room.players.length < 2) {
return m.reply("❌ Need at least 2 players to start");
}

if (room.status !== 'waiting') {
return m.reply("❌ Game already in progress");
}

// Check if all players have enough balance
for (let player of room.players) {
if (global.db.data.users[player.id][room.betType] < room.betAmount) {
return m.reply(`❌ @${player.name} doesn't have enough ${room.betType}`);
}
}

// Deduct bets from all players
for (let player of room.players) {
global.db.data.users[player.id][room.betType] -= room.betAmount;
}

// Initialize game
let dealerCards = [pickCard(), pickCard()];
let playerHands = {};

for (let player of room.players) {
let playerCards = [pickLowCard(), pickLowCard()];
while (calculateTotal(playerCards) >= 10) {
playerCards = [pickLowCard(), pickLowCard()];
}

playerHands[player.id] = {
cards: playerCards,
status: 'active',
canDouble: true,
bet: room.betAmount
};
}

room.status = 'playing';
room.currentTurn = 0;
room.gameData = {
dealerCards: dealerCards,
playerHands: playerHands,
round: 1
};

let currentPlayer = room.players[room.currentTurn];
let currentHand = playerHands[currentPlayer.id];
let playerTotal = calculateTotal(currentHand.cards);
let dealerShowCard = dealerCards[0];

let playersList = room.players.map((p, i) =>
`${i === room.currentTurn ? '🔥' : '⭐'} @${p.name}`
).join('\n│ ');

return conn.reply(m.chat, `🎰 BLACKJACK PVP STARTED 🎰

╭─ 🏠 ROOM INFO
│ Room ID: ${room.id}
│ Round: ${room.gameData.round}
│ Players: ${room.players.length}
├─ 👥 PLAYERS
│ ${playersList}
├─ 🎯 CURRENT TURN
│ Player: @${currentPlayer.name}
│ Cards: ${currentHand.cards.join(" ")}
│ Total: ${playerTotal}
├─ 🤖 DEALER HAND
│ Cards: ${dealerShowCard} [?]
├─ 💰 BET INFO
│ Amount: ${room.betAmount} ${room.betType}
│ Total Pot: ${room.betAmount * room.players.length} ${room.betType}
╰─ ⚙️ YOUR TURN @${currentPlayer.name}

Commands:
• hit - Take another card
• stand - End your turn
• double - Double bet + 1 card only`, m, {
mentions: room.players.map(p => p.id),
contextInfo: {
externalAdReply: {
title: "🎰 BLACKJACK PVP",
body: "Game Started!",
thumbnailUrl: "https://telegra.ph/file/1703cff0a758d0ef8f84f.png",
sourceUrl: "",
mediaType: 1,
renderLargerThumbnail: true,
},
},
});
}

return m.reply("❌ Unknown command. Use blackjackpvp for help");
}

handler.before = async (m) => {
if (!conn.blackjack2) return;
if (m.isBaileys) return;

let txt = (m.msg.selectedDisplayText ? m.msg.selectedDisplayText : m.text ? m.text : "").toLowerCase();
if (!["hit", "stand", "double"].includes(txt)) return;

// Find user's room
let roomId = null;
for (let id in conn.blackjack2) {
if (conn.blackjack2[id].players.some(p => p.id === m.sender) &&
conn.blackjack2[id].status === 'playing' &&
conn.blackjack2[id].chatId === m.chat) {
roomId = id;
break;
}
}

if (!roomId) return;

let room = conn.blackjack2[roomId];
let currentPlayer = room.players[room.currentTurn];

// Check if it's this player's turn
if (currentPlayer.id !== m.sender) {
return m.reply(`❌ Not your turn! Current turn: @${currentPlayer.name}`);
}

let gameData = room.gameData;
let playerHand = gameData.playerHands[m.sender];

if (playerHand.status !== 'active') return;

// Helper functions (same as above)
let cards = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
let suits = ["♠", "♥", "♦", "♣"];

let calculateTotal = (cardArray) => {
let total = 0;
let aces = 0;

for (let card of cardArray) {
let value = card.replace(/[♠♥♦♣]/g, '');
if (value === "A") {
total += 11;
aces++;
} else if (value === "K" || value === "Q" || value === "J") {
total += 10;
} else {
total += parseInt(value);
}
}

while (aces > 0 && total > 21) {
total -= 10;
aces--;
}

return total;

};

let pickCard = () => {
let card = cards[Math.floor(Math.random() * cards.length)];
let suit = suits[Math.floor(Math.random() * suits.length)];
return card + suit;
};

let getUserName = (userId) => {
return userId.split('@')[0];
};

let isBlackjack = (cards) => {
if (cards.length !== 2) return false;
let values = cards.map(card => card.replace(/[♠♥♦♣]/g, ''));
return (values.includes("A") && (values.includes("10") || values.includes("J") || values.includes("Q") || values.includes("K")));
};

let moveToNextPlayer = () => {
    // Cek semua pemain sudah selesai atau belum
    let allPlayersFinished = true;
    
    for (let player of room.players) {
        let playerHand = gameData.playerHands[player.id];
        if (playerHand.status === 'active') {
            allPlayersFinished = false;
            break;
        }
    }
    
    // Jika semua pemain sudah selesai, return true untuk resolve game
    if (allPlayersFinished) {
        return true;
    }
    
    // Cari pemain berikutnya yang masih aktif
    let originalTurn = room.currentTurn;
    let foundActivePlayer = false;
    
    do {
        room.currentTurn = (room.currentTurn + 1) % room.players.length;
        let currentPlayerHand = gameData.playerHands[room.players[room.currentTurn].id];
        
        if (currentPlayerHand.status === 'active') {
            foundActivePlayer = true;
            break;
        }
        
        // Jika sudah kembali ke posisi awal dan tidak ada pemain aktif
        if (room.currentTurn === originalTurn) {
            break;
        }
    } while (!foundActivePlayer);
    
    // Double check: jika tidak ada pemain aktif yang ditemukan
    if (!foundActivePlayer) {
        return true; // Semua pemain sudah selesai
    }
    
    return false; // Masih ada pemain aktif
};

let resolveGame = async () => {
// Dealer plays
let dealerTotal = calculateTotal(gameData.dealerCards);
while (dealerTotal < 17) {
gameData.dealerCards.push(pickCard());
dealerTotal = calculateTotal(gameData.dealerCards);
}

let results = [];
let winners = [];

for (let player of room.players) {
let hand = gameData.playerHands[player.id];
let playerTotal = calculateTotal(hand.cards);
let result = "";
let winAmount = 0;

if (hand.status === 'bust') {
result = `BUST (-${hand.bet} ${room.betType})`;
} else if (isBlackjack(hand.cards)) {
winAmount = Math.floor(hand.bet * 2.5); // Return bet + 1.5x win
result = `BLACKJACK (+${Math.floor(hand.bet * 1.5)} ${room.betType})`;
winners.push(player.name);
} else if (dealerTotal > 21) {
winAmount = hand.bet * 2; // Return bet + win
result = `WIN (+${hand.bet} ${room.betType})`;
winners.push(player.name);
} else if (playerTotal > dealerTotal) {
winAmount = hand.bet * 2;
result = `WIN (+${hand.bet} ${room.betType})`;
winners.push(player.name);
} else if (playerTotal < dealerTotal) {
result = `LOSE (-${hand.bet} ${room.betType})`;
} else {
winAmount = hand.bet; // Return bet only
result = `PUSH (+0 ${room.betType})`;
}

if (winAmount > 0) {
global.db.data.users[player.id][room.betType] += winAmount;
}

results.push(`@${player.name}: ${playerTotal} = ${result}`);
}

let playersList = room.players.map(p => {
let hand = gameData.playerHands[p.id];
let total = calculateTotal(hand.cards);
let status = hand.status === 'bust' ? '💥' : total === 21 && hand.cards.length === 2 ? '🎯' : total > 17 ? '🔥' : '⭐';
return `${status} @${p.name}: ${hand.cards.join(" ")} = ${total}`;
}).join('\n│ ');

let message = `🎰 BLACKJACK PVP RESULTS 🎰

╭─ 🏠 ROOM INFO
│ Room ID: ${room.id}
│ Players: ${room.players.length}
├─ 👥 FINAL HANDS
│ ${playersList}
├─ 🤖 DEALER FINAL
│ Cards: ${gameData.dealerCards.join(" ")}
│ Total: ${dealerTotal}${dealerTotal > 21 ? ' (BUST)' : ''}
├─ 💰 RESULTS
│ ${results.join('\n│ ')}
├─ 🏆 SUMMARY
│ Winners: ${winners.length > 0 ? winners.map(n => `@${n}`).join(', ') : 'House wins'}
│ Total Pot: ${room.betAmount * room.players.length} ${room.betType}
╰─ 🎮 GAME COMPLETE

Room has been dissolved`;

await conn.reply(m.chat, message, m, {
mentions: room.players.map(p => p.id),
contextInfo: {
externalAdReply: {
title: "🎰 BLACKJACK PVP",
body: "Game Complete",
thumbnailUrl: "https://telegra.ph/file/1703cff0a758d0ef8f84f.png",
sourceUrl: "",
mediaType: 1,
renderLargerThumbnail: true,
},
},
});


delete conn.blackjack2[roomId];

};

try {
if (txt === "hit") {
playerHand.cards.push(pickCard());
let total = calculateTotal(playerHand.cards);
playerHand.canDouble = false;

if (total > 21) {
playerHand.status = 'bust';

let allDone = moveToNextPlayer();    
if (allDone) {    
  await resolveGame();    
  return;    
}    

let nextPlayer = room.players[room.currentTurn];    
let nextHand = gameData.playerHands[nextPlayer.id];    
let nextTotal = calculateTotal(nextHand.cards);    

let playersList = room.players.map((p, i) =>     
  `${i === room.currentTurn ? '🔥' : '⭐'} @${p.name}${gameData.playerHands[p.id].status === 'bust' ? ' 💥' : ''}`    
).join('\n│ ');    

let message = `🎰 PLAYER BUST 🎰

╭─ 🏠 ROOM INFO
│ Room ID: ${room.id}
│ Round: ${gameData.round}
├─ 💥 BUST RESULT
│ @${getUserName(m.sender)}: ${playerHand.cards.join(" ")} = ${total}
├─ 👥 PLAYERS STATUS
│ ${playersList}
├─ 🎯 NEXT TURN
│ Player: @${nextPlayer.name}
│ Cards: ${nextHand.cards.join(" ")}
│ Total: ${nextTotal}
├─ 🤖 DEALER HAND
│ Cards: ${gameData.dealerCards[0]} [?]
╰─ ⚙️ YOUR TURN @${nextPlayer.name}

Commands:
• hit - Take another card
• stand - End your turn
• double - Double bet + 1 card only`;

return conn.reply(m.chat, message, m, {
mentions: room.players.map(p => p.id),
contextInfo: {
externalAdReply: {
title: "🎰 BLACKJACK PVP",
body: "Player Bust",
thumbnailUrl: "https://telegra.ph/file/1703cff0a758d0ef8f84f.png",
sourceUrl: "",
mediaType: 1,
renderLargerThumbnail: true,
},
},
});
}

let allDone = moveToNextPlayer();
if (allDone) {
await resolveGame();
return;
}

let nextPlayer = room.players[room.currentTurn];
let nextHand = gameData.playerHands[nextPlayer.id];
let nextTotal = calculateTotal(nextHand.cards);

let playersList = room.players.map((p, i) =>
`${i === room.currentTurn ? '🔥' : '⭐'} @${p.name}${gameData.playerHands[p.id].status !== 'active' ? ' ✅' : ''}`
).join('\n│ ');

let message = `🎰 CARD DEALT 🎰

╭─ 🏠 ROOM INFO
│ Room ID: ${room.id}
│ Round: ${gameData.round}
├─ 🃏 LAST ACTION
│ @${getUserName(m.sender)}: ${playerHand.cards.join(" ")} = ${total}
├─ 👥 PLAYERS STATUS
│ ${playersList}
├─ 🎯 CURRENT TURN
│ Player: @${nextPlayer.name}
│ Cards: ${nextHand.cards.join(" ")}
│ Total: ${nextTotal}
├─ 🤖 DEALER HAND
│ Cards: ${gameData.dealerCards[0]} [?]
╰─ ⚙️ YOUR TURN @${nextPlayer.name}

Commands:
• hit - Take another card
• stand - End your turn
• double - Double bet + 1 card only`;

return conn.reply(m.chat, message, m, {
mentions: room.players.map(p => p.id),
contextInfo: {
externalAdReply: {
title: "🎰 BLACKJACK PVP",
body: "Card Dealt",
thumbnailUrl: "https://telegra.ph/file/1703cff0a758d0ef8f84f.png",
sourceUrl: "",
mediaType: 1,
renderLargerThumbnail: true,
},
},
});
}

if (txt === "stand") {
playerHand.status = 'stand';
let total = calculateTotal(playerHand.cards);

let allDone = moveToNextPlayer();
if (allDone) {
await resolveGame();
return;
}

let nextPlayer = room.players[room.currentTurn];
let nextHand = gameData.playerHands[nextPlayer.id];
let nextTotal = calculateTotal(nextHand.cards);

let playersList = room.players.map((p, i) =>
`${i === room.currentTurn ? '🔥' : '⭐'} @${p.name}${gameData.playerHands[p.id].status !== 'active' ? ' ✅' : ''}`
).join('\n│ ');

let message = `🎰 PLAYER STANDS 🎰

╭─ 🏠 ROOM INFO
│ Room ID: ${room.id}
│ Round: ${gameData.round}
├─ ✅ STAND ACTION
│ @${getUserName(m.sender)}: ${playerHand.cards.join(" ")} = ${total}
├─ 👥 PLAYERS STATUS
│ ${playersList}
├─ 🎯 CURRENT TURN
│ Player: @${nextPlayer.name}
│ Cards: ${nextHand.cards.join(" ")}
│ Total: ${nextTotal}
├─ 🤖 DEALER HAND
│ Cards: ${gameData.dealerCards[0]} [?]
╰─ ⚙️ YOUR TURN @${nextPlayer.name}

Commands:
• hit - Take another card
• stand - End your turn
• double - Double bet + 1 card only`;

return conn.reply(m.chat, message, m, {
mentions: room.players.map(p => p.id),
contextInfo: {
externalAdReply: {
title: "🎰 BLACKJACK PVP",
body: "Player Stands",
thumbnailUrl: "https://telegra.ph/file/1703cff0a758d0ef8f84f.png",
sourceUrl: "",
mediaType: 1,
renderLargerThumbnail: true,
},
},
});
}

if (txt === "double") {
if (!playerHand.canDouble) {
return m.reply("❌ Cannot double down anymore!");
}

// Check if player has enough balance for double
if (global.db.data.users[m.sender][room.betType] < playerHand.bet) {
return m.reply(`❌ Not enough ${room.betType} to double down!`);
}

// Deduct additional bet
global.db.data.users[m.sender][room.betType] -= playerHand.bet;
playerHand.bet *= 2;

// Deal one card and stand automatically
playerHand.cards.push(pickCard());
let total = calculateTotal(playerHand.cards);
playerHand.canDouble = false;

if (total > 21) {
playerHand.status = 'bust';
} else {
playerHand.status = 'stand';
}

let allDone = moveToNextPlayer();
if (allDone) {
await resolveGame();
return;
}

let nextPlayer = room.players[room.currentTurn];
let nextHand = gameData.playerHands[nextPlayer.id];
let nextTotal = calculateTotal(nextHand.cards);

let playersList = room.players.map((p, i) =>
`${i === room.currentTurn ? '🔥' : '⭐'} @${p.name}${gameData.playerHands[p.id].status === 'bust' ? ' 💥' : gameData.playerHands[p.id].status === 'stand' ? ' ✅' : ''}`
).join('\n│ ');

let resultText = total > 21 ? 'DOUBLED & BUST' : 'DOUBLED & STAND';
let message = `🎰 ${resultText} 🎰

╭─ 🏠 ROOM INFO
│ Room ID: ${room.id}
│ Round: ${gameData.round}
├─ 💰 DOUBLE DOWN
│ @${getUserName(m.sender)}: ${playerHand.cards.join(" ")} = ${total}
│ New Bet: ${playerHand.bet} ${room.betType}
├─ 👥 PLAYERS STATUS
│ ${playersList}
├─ 🎯 CURRENT TURN
│ Player: @${nextPlayer.name}
│ Cards: ${nextHand.cards.join(" ")}
│ Total: ${nextTotal}
├─ 🤖 DEALER HAND
│ Cards: ${gameData.dealerCards[0]} [?]
╰─ ⚙️ YOUR TURN @${nextPlayer.name}

Commands:
• hit - Take another card
• stand - End your turn
• double - Double bet + 1 card only`;

return conn.reply(m.chat, message, m, {
mentions: room.players.map(p => p.id),
contextInfo: {
externalAdReply: {
title: "🎰 BLACKJACK PVP",
body: total > 21 ? "Double Down Bust" : "Double Down Stand",
thumbnailUrl: "https://telegra.ph/file/1703cff0a758d0ef8f84f.png",
sourceUrl: "",
mediaType: 1,
renderLargerThumbnail: true,
},
},
});
}

} catch (error) {
console.error("Blackjack error:", error);
return m.reply("❌ An error occurred during the game. Please try again.");
}
};

handler.help = ['blackjackpvp'].map(v => v + ' <create|join|leave|bet|start>');
handler.tags = ['game'];
handler.command = /^(bjpvp|blackjackpvp)$/i;
handler.register = false;
handler.group = true;
handler.game = true;

export default handler;