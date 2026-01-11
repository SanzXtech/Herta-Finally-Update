let handler = async (m) => {
    let who;
    let user = global.db.data.users[m.sender];

    // Atribut pengguna
    let armor = user.armor;
    let sword = user.sword;
    let fishingrod = user.fishingrod;
    let gun = user.pistol;
    let pickaxe = user.pickaxe;
    let armordurability = user.armordurability;
    let sworddurability = user.sworddurability;
    let fishingroddurability = user.fishingroddurability;
    let ammo = user.peluru;
    let pickaxedurability = user.pickaxedurability;

    // Atribut tambahan
    let speed = user.speed;
    let strength = user.strength;
    let defense = user.defense;
    let potion = user.potion;

    if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.sender;
    else who = m.sender;

    if (typeof db.data.users[who] == 'undefined') throw 'Pengguna tidak ada di dalam database';

    // Menghitung persentase darah dan menampilkan tampilan darah
    let health = user.health;
    let hearts = '';
    let healthCount = Math.ceil(health / 40);
    for (let i = 0; i < 5; i++) {
        hearts += healthCount > 0 ? '▬' : '▭';
        healthCount--;
    }
    let healthDisplay = hearts.trim() + `   ${user.health}/200`;

    // Menghitung persentase stamina dan menampilkan tampilan stamina
    let stamina = user.stamina;
    let bars = '';
    let staminaCount = Math.ceil(stamina / 40);
    for (let i = 0; i < 5; i++) {
        bars += staminaCount > 0 ? '▬' : '▭';
        staminaCount--;
    }
    let staminaDisplay = bars.trim() + `   ${user.stamina}/200`;

    // Menampilkan tampilan durabilitas untuk setiap peralatan
    let durabilityswords = '';
    let swordCount = Math.ceil(sworddurability / 20);
    for (let i = 0; i < 5; i++) {
        durabilityswords += swordCount > 0 ? '▬' : '▭';
        swordCount--;
    }
    let sworddurabilityDisplay = durabilityswords.trim() + `   ${user.sworddurability}/100`;

    let durabilityfishingrods = '';
    let fishingrodCount = Math.ceil(fishingroddurability / 20);
    for (let i = 0; i < 5; i++) {
        durabilityfishingrods += fishingrodCount > 0 ? '▬' : '▭';
        fishingrodCount--;
    }
    let fishingroddurabilityDisplay = durabilityfishingrods.trim() + `   ${user.fishingroddurability}/100`;

    let durabilityarmors = '';
    let armorCount = Math.ceil(armordurability / 20);
    for (let i = 0; i < 5; i++) {
        durabilityarmors += armorCount > 0 ? '▬' : '▭';
        armorCount--;
    }
    let armordurabilityDisplay = durabilityarmors.trim() + `   ${user.armordurability}/100`;

    let durabilitypickaxes = '';
    let pickaxeCount = Math.ceil(pickaxedurability / 20);
    for (let i = 0; i < 5; i++) {
        durabilitypickaxes += pickaxeCount > 0 ? '▬' : '▭';
        pickaxeCount--;
    }
    let pickaxedurabilityDisplay = durabilitypickaxes.trim() + `   ${user.pickaxedurability}/100`;

    // Menampilkan informasi peralatan dan status pengguna
    let message = `乂 *S T A T S* 乂\n
- 👑 *User*: ${user.registered ? user.name : conn.getName(m.sender)}
- 🎗️ *Role*: ${user.role}
- 📊 *Level*: ${user.level}
- ❤️ *Darah*: ${healthDisplay}
- 🌀 *Stamina*: ${staminaDisplay}
- 🏃 *Speed*: ${speed}
- 💪 *Strength*: ${strength}
- 🛡️ *Defense*: ${defense}
- 🧪 *Potion*: ${potion}
乂 *E Q U I P M E N T* 乂\n
- 🧥 *Armor*: ${armor == 0 ? 'Tidak Punya' : '' || armor == 1 ? 'Leather Armor' : '' || armor == 2 ? 'Iron Armor' : '' || armor == 3 ? 'Gold Armor' : '' || armor == 4 ? 'Diamond Armor' : '' || armor == 5 ? 'Emerald Armor' : '' || armor == 6 ? 'Crystal Armor' : '' || armor == 7 ? 'Obsidian Armor' : '' || armor == 8 ? 'Netherite Armor' : '' || armor == 9 ? 'Wither Armor' : '' || armor == 10 ? 'Dragon Armor' : '' || armor == 11 ? 'Sanz’z Exclusive Mecha' : ''}
- ⚔️ *Sword*: ${sword == 0 ? 'Tidak Punya' : '' || sword == 1 ? 'Wooden Sword' : '' || sword == 2 ? 'Stone Sword' : '' || sword == 3 ? 'Iron Sword' : '' || sword == 4 ? 'Gold Sword' : '' || sword == 5 ? 'Copper Sword' : '' || sword == 6 ? 'Diamond Sword' : '' || sword == 7 ? 'Emerald Sword' : '' || sword == 8 ? 'Obsidian Sword' : '' || sword == 9 ? 'Netherite Sword' : '' || sword == 10 ? 'Samurai Slayer Green Sword' : '' || sword == 11 ? 'Sanz’s Chimera Sword' : ''}
- 🎣 *Fishing Rod*: ${fishingrod == 0 ? 'Tidak Punya' : '' || fishingrod == 1 ? 'Wooden Fishingrod' : '' || fishingrod == 2 ? 'Stone Fishingrod' : '' || fishingrod == 3 ? 'Iron Fishingrod' : '' || fishingrod == 4 ? 'Gold Fishingrod' : '' || fishingrod == 5 ? 'Copper Fishingrod' : '' || fishingrod == 6 ? 'Diamond Fishingrod' : '' || fishingrod == 7 ? 'Emerald Fishingrod' : '' || fishingrod == 8 ? 'Crystal Fishingrod' : '' || fishingrod == 9 ? 'Obsidian Fishingrod' : '' || fishingrod == 10 ? 'God Fishingrod' : '' || fishingrod == 11 ? 'Sanz’s DevRod' : ''}
- 🔫 *Gun*: ${gun == 0 ? 'Tidak Punya' : '' || gun == 1 ? 'Glock 17' : '' || gun == 2 ? 'S&W 500M' : '' || gun == 3 ? 'Dessert Eagle' : '' || gun == 4 ? 'SIG Sauer P226r' : '' || gun == 5 ? 'Ragur Super RedHawk' : ''}
- ⛏️ *Pickaxe*: ${pickaxe == 0 ? 'Tidak Punya' : '' || pickaxe == 1 ? 'Wooden Pickaxe' : '' || pickaxe == 2 ? 'Stone Pickaxe' : '' || pickaxe == 3 ? 'Iron Pickaxe' : '' || pickaxe == 4 ? 'Gold Pickaxe' : '' || pickaxe == 5 ? 'Copper Pickaxe' : '' || pickaxe == 6 ? 'Diamond Pickaxe' : '' || pickaxe == 7 ? 'Emerald Pickaxe' : '' || pickaxe == 8 ? 'Crystal Pickaxe' : '' || pickaxe == 9 ? 'Obsidian Pickaxe' : '' || pickaxe == 10 ? 'Netherite Pickaxe' : '' || pickaxe == 11 ? 'Sanz`s Exclusive 100 Level Pickaxe' : ''}

乂 *D U R A B I L I T Y* 乂\n
- 🛡️ *Armor Durability*: ${armordurability}/100
- 🛡️ *Bar Armor*: ${armordurabilityDisplay}
- ⚔️ *Sword Durability*: ${sworddurability}/100
- ⚔️ *Bar Sword*: ${sworddurabilityDisplay}
- 🎣 *Fishing Rod Durability*: ${fishingroddurability}/100
- 🎣 *Bar Fishing Rod*: ${fishingroddurabilityDisplay}
- ⛏️ *Pickaxe Durability*: ${pickaxedurability}/100
- ⛏️ *Bar Pickaxe*: ${pickaxedurabilityDisplay}
- 🔫 *Ammo*: ${ammo}`;

    let skyid = {
        text: message.trim(),
        contextInfo: {
            externalAdReply: {
                title: `ʙᴀᴄᴋᴘᴀᴄᴋ [ʀᴘɢ]`,
                body: "",
                thumbnailUrl: `https://pomf2.lain.la/f/gyuig65c.jpg`,
                sourceUrl: `https://whatsapp.com/channel/0029VafEhDUIXnlyGgMSgH2u`,
                mediaType: 1,
                renderLargerThumbnail: true,
            },
        },
    };

    // Send the message with skyid
    await conn.sendMessage(m.chat, skyid, { quoted: m });
};

handler.help = ['weapon'];
handler.tags = ['rpg'];
handler.command = /^(backpack|backpacks|weapon|weapons|wepon)$/i;
handler.rpg = true
handler.register = true
handler.group = true
export default handler
