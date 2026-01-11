import { promises, readFileSync } from 'fs'
let misi = JSON.parse(readFileSync('./lib/misi.json'))

const rankDifficulty = {
  "SS": { name: "Sangat Sulit", successRate: 30, color: "🔴" },
  "S": { name: "Sulit", successRate: 45, color: "🟠" },
  "A": { name: "Menantang", successRate: 60, color: "🟡" },
  "B": { name: "Sedang", successRate: 70, color: "🔵" },
  "C": { name: "Mudah", successRate: 80, color: "🟢" },
  "D": { name: "Sangat Mudah", successRate: 90, color: "⚪" },
  "E": { name: "Pemula", successRate: 95, color: "🟤" }
}

function createProgressBar(current, max, length = 10) {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100))
  const filled = Math.round((percentage / 100) * length)
  const empty = length - filled
  return '▰'.repeat(filled) + '▱'.repeat(empty) + ` ${current}/${max}`
}

// Function untuk check equipment yang dibutuhkan untuk pesan gabungan
function checkMissingEquipment(user) {
  let missing = []
  let lowHealth = user.health < 50
  let lowStamina = user.stamina < 50
  
  if ((lowHealth || lowStamina) && (user.armor < 1 || user.sword < 1)) {
    if (user.armor < 1 && user.sword < 1) {
      missing.push("🥼 Armor + ⚔️ Sword")
    } else if (user.armor < 1) {
      missing.push("🥼 Armor")
    } else if (user.sword < 1) {
      missing.push("⚔️ Sword")
    }
  }
  
  return missing
}

// Function untuk handle death dan level down
function handleDeath(user) {
  if (user.health <= 0 || user.stamina <= 0 || user.armor <= 0 || user.sword <= 0) {
    // User mati, turun 1 level
    user.level = Math.max(1, (user.level || 1) - 1)
    user.health = 100 // Reset health ke 100 setelah mati
    user.stamina = 100 // Reset stamina juga
    return true
  }
  return false
}

async function handler(m, { conn, args, text , usedPrefix, command }) {
  conn.mission = conn.mission ? conn.mission : {}
  conn.missionCooldown = conn.missionCooldown ? conn.missionCooldown : {}
  
  if(m.sender in conn.mission) return m.reply("Kamu Masih Melakukan Misi, Tunggu Sampai Selesai!!")

  try {
    let json = misi[Math.floor(Math.random() * misi.length)] //get misi
    const cooldown = 15 * (1000 * 60) //cooldown timer in milliseconds
    let user = global.db.data.users[m.sender] //Get db user
    
    // Initialize level if not exists
    if(typeof user.level != "number") global.db.data.users[m.sender].level = 1
    
    // Check cooldown dari terima/tolak sebelumnya
    if (conn.missionCooldown[m.sender]) {
      let cooldownTime = conn.missionCooldown[m.sender].endTime - Date.now()
      if (cooldownTime > 0) {
        let cooldownType = conn.missionCooldown[m.sender].type
        return m.reply(`⏰ Kamu dalam cooldown ${cooldownType}!\nSisa waktu: ${clockString(cooldownTime)}`)
      } else {
        delete conn.missionCooldown[m.sender]
      }
    }
    
    if (user.stamina < 100) return m.reply(`⚡ Stamina Kamu Kurang Dari 100, Tidak Bisa Menjalankan Misi\nKetik *.heal stamina* Untuk Menggunakan Potion`)
    
    // Check missing equipment untuk pesan gabungan jika health/stamina rendah
    let missingEquipment = checkMissingEquipment(user)
    
    if (user.armor < 1 || user.sword < 1) {
      let missing = []
      if (user.armor < 1) missing.push("🥼 armor")
      if (user.sword < 1) missing.push("⚔️ sword")
      
      let message = `Kamu belum memiliki ${missing.join(" dan ")} ketik *.craft* untuk membuat armor dan sword.`
      
      // Tambahan pesan jika health/stamina rendah dan butuh equipment
      if (missingEquipment.length > 0) {
        message += `\n\n⚠️ *KONDISI KRITIS:* Health/Stamina di bawah 50!\nSebaiknya craft ${missingEquipment.join(" dan ")} sekaligus untuk efisiensi.`
      }
      
      return m.reply(message)
    }

    if(typeof user.lastmission != "number") global.db.data.users[m.sender].lastmission = 0
    if(typeof user.exp != "number") global.db.data.users[m.sender].exp = 0
    if(typeof user.diamond != "number") global.db.data.users[m.sender].diamond = 0

    let timers = (cooldown - (new Date - user.lastmission))
    if(new Date - user.lastmission <= cooldown) return m.reply(`Kamu Sudah Menjalankan Misi, Tunggu Selama ${clockString(timers)}`)
    if(user.skill == "") return m.reply("Kamu Belum Mempunyai Skill")

    if(!(m.sender in conn.mission)) {
      conn.mission[m.sender] = {
        sender: m.sender,
        timeout: setTimeout(() => {m.reply('timed out');delete conn.mission[m.sender]}, 60000),
        json
      }
      
      let rank = rankDifficulty[json.rank] || rankDifficulty["E"]
      let armorBar = createProgressBar(user.armordurability || 0, 100)
      let swordBar = createProgressBar(user.sworddurability || 0, 100)
      let healthBar = createProgressBar(user.health || 0, 200)
      let staminaBar = createProgressBar(user.stamina || 0, 200)
      
      let fkontak = {
        "key": {
          "participants": "0@s.whatsapp.net",
          "remoteJid": "status@broadcast",
          "fromMe": false,
          "id": "Halo"
        },
        "message": {
          "contactMessage": {
            "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
          }
        },
        "participant": "0@s.whatsapp.net"
      }

      let caption = `╭─「 📝 *MISI TERSEDIA* 」
│ 
├ ${rank.color} *Rank:* ${json.rank} (${rank.name})
├ 📊 *Tingkat Kesulitan:* ${100 - rank.successRate}%
├ ✉️ *Misi:* ${json.misii}
│
├─「 💰 *REWARD* 」
├ 🧪 *Exp:* ${json.exp}
├ 💎 *Diamond:* ${json.diamond}
${json.gold ? `├ 🪙 *Gold:* ${json.gold}` : ''}
${json.emerald ? `├ 💚 *Emerald:* ${json.emerald}` : ''}
│
├─「 💸 *BIAYA* 」
├ ❤️ *Health:* -${json.health}
├ ⚡ *Stamina:* -${json.stamina}
│
├─「 👤 *STATUS KARAKTER* 」
├ 🏆 *Level:* ${user.level || 1}
├ ❤️ *Health:* ${healthBar}
├ ⚡ *Stamina:* ${staminaBar}
│
├─「 ⚔️ *EQUIPMENT STATUS* 」
├ 🥼 *Armor Lv.${user.armor || 1}:* ${armorBar}
├ ⚔️ *Sword Lv.${user.sword || 1}:* ${swordBar}
│
├─「 ⏰ *INFO COOLDOWN* 」
├ 🔄 *Terima:* 1 jam
├ ❌ *Tolak:* 1 menit
│
╰─「 Ketik *terima* atau *tolak* 」`

      return conn.sendMessage(m.chat, { text: caption }, { quoted: fkontak })
    }
  } catch (e) {
    console.error(e)
    if(m.sender in conn.mission) {
      let { timeout } = conn.mission[m.sender]
      clearTimeout(timeout)
      delete conn.mission[m.sender]
      m.reply('Rejected')
    }
  }
}

handler.before = async m => {
  conn.mission = conn.mission ? conn.mission : {}
  conn.missionCooldown = conn.missionCooldown ? conn.missionCooldown : {}
  
  if(!(m.sender in conn.mission)) return
  if(m.isBaileys) return

  let { timeout, json } = conn.mission[m.sender]
  const cooldown = 5 * (1000 * 60) //cooldown timer in milliseconds
  let user = global.db.data.users[m.sender] //Get db user

  if (user.armor < 1 || user.sword < 1) {
    let missing = []
    if (user.armor < 1) missing.push("🥼 armor")
    if (user.sword < 1) missing.push("⚔️ sword")
    
    let message = `Kamu belum memiliki ${missing.join(" dan ")} ketik *.craft* untuk membuat armor dan sword.`
    
    // Tambahan pesan jika health/stamina rendah dan butuh equipment
    let missingEquipment = checkMissingEquipment(user)
    if (missingEquipment.length > 0) {
      message += `\n\n⚠️ *KONDISI KRITIS:* Health/Stamina di bawah 50!\nSebaiknya craft ${missingEquipment.join(" dan ")} sekaligus untuk efisiensi.`
    }
    
    return m.reply(message)
  }

  let txt = (m.msg && m.msg.selectedDisplayText ? m.msg.selectedDisplayText : m.text ? m.text : '').toLowerCase()
  if(txt != "terima" && txt != "tolak" && txt != "gas") return

  if(typeof user.lastmission != "number") global.db.data.users[m.sender].lastmission = 0
  if(typeof user.exp != "number") global.db.data.users[m.sender].exp = 0
  if(typeof user.diamond != "number") global.db.data.users[m.sender].diamond = 0
  if(typeof user.level != "number") global.db.data.users[m.sender].level = 1

  let timers = (cooldown - (new Date - user.lastmission))
  if(new Date - user.lastmission <= cooldown) return m.reply(`Kamu Sudah Melakukan Misi, Mohon Tunggu ${clockString(timers)}`)
  if(!user.skill) return m.reply("Kamu Belum Mempunyai Skill")

  // Simplified success/failure logic based on rank difficulty
  let rank = rankDifficulty[json.rank] || rankDifficulty["E"]
  let randomSuccess = Math.random() * 100
  let isSuccess = randomSuccess <= rank.successRate

  let aud = ["Mana Habis", "Stamina Habis", "Diserang Monster", "Dibokong Monster"];
  let failureReason = aud[Math.floor(Math.random() * aud.length)];

  try {
    if(/^terima?$/i.test(txt)) {
      // Set cooldown 1 jam untuk terima
      conn.missionCooldown[m.sender] = {
        type: "menerima misi",
        endTime: Date.now() + (60 * 60 * 1000) // 1 jam
      }
      
      let resultMessage = "";
      let warnings = [];
      let rank = rankDifficulty[json.rank] || rankDifficulty["E"]

      if(isSuccess) {
        resultMessage = `╭─「 ✅ *MISI BERHASIL* 」
│ 
├ 🎯 *Misi:* ${json.misii}
├ ${rank.color} *Rank:* ${json.rank} (${rank.name})
│
├─「 🎁 *REWARD DITERIMA* 」
├ 🧪 *Exp:* +${json.exp}
├ 💎 *Diamond:* +${json.diamond}
${json.gold ? `├ 🪙 *Gold:* +${json.gold}` : ''}
${json.emerald ? `├ 💚 *Emerald:* +${json.emerald}` : ''}
╰─────────────────────`;
        
        user.exp += json.exp || 0;
        user.diamond += json.diamond || 0;
        if(json.gold) user.gold = (user.gold || 0) + json.gold;
        if(json.emerald) user.emerald = (user.emerald || 0) + json.emerald;

        // Reduce durability on success
        if(user.armordurability) user.armordurability -= 10;
        if(user.sworddurability) user.sworddurability -= 10;

      } else {
        resultMessage = `╭─「 ❌ *MISI GAGAL* 」
│ 
├ 🎯 *Misi:* ${json.misii}
├ ${rank.color} *Rank:* ${json.rank} (${rank.name})
├ 💥 *Alasan:* ${failureReason}
╰─────────────────────`;

        // Reduce more durability on failure
        if(user.armordurability) user.armordurability -= 20;
        if(user.sworddurability) user.sworddurability -= 20;
      }

      // Check and handle armor durability
      if (user.armordurability && user.armordurability <= 0) {
        user.armor = Math.max(0, (user.armor || 1) - 1);
        if (user.armor > 0) {
          user.armordurability = 100;
        } else {
          user.armordurability = 0;
          warnings.push("🥼 Armor kamu hancur!");
        }
      }

      // Check and handle sword durability
      if (user.sworddurability && user.sworddurability <= 0) {
        user.sword = Math.max(0, (user.sword || 1) - 1);
        if (user.sword > 0) {
          user.sworddurability = 100;
        } else {
          user.sworddurability = 0;
          warnings.push("⚔️ Pedang kamu hancur!");
        }
      }

      // Reduce health and stamina
      user.health = Math.max(0, (user.health || 200) - (json.health || 0));
      user.stamina = Math.max(0, (user.stamina || 200) - (json.stamina || 0));

      // Check for death dan handle level down
      let isDead = handleDeath(user)
      if (isDead) {
        warnings.push(`💀 GAME OVER! MISI GAGAL!`);
        warnings.push(`📉 Level turun dari ${user.level + 1} ke ${user.level}`);
        warnings.push("🔄 Health dan Stamina telah direset!");
        resultMessage = `╭─「 💀 *MISI GAGAL - KEMATIAN* 」
│ 
├ 🎯 *Misi:* ${json.misii}
├ ${rank.color} *Rank:* ${json.rank} (${rank.name})
├ 💀 *Status:* MATI
├ 💥 *Penyebab:* ${user.health <= 0 ? 'Health habis' : user.stamina <= 0 ? 'Stamina habis' : user.armor <= 0 ? 'Armor hancur' : 'Sword hancur'}
╰─────────────────────`;
      } else {
        // Warning untuk kondisi kritis tanpa mati
        if (user.health <= 0) {
          warnings.push("⚠️ Health kamu habis! Berbahaya!");
        } else if (user.health <= 30) {
          warnings.push("⚠️ Health kamu sangat rendah!");
        }
        
        if (user.stamina <= 0) {
          warnings.push("⚠️ Stamina kamu habis!");
        } else if (user.stamina <= 30) {
          warnings.push("⚠️ Stamina kamu sangat rendah!");
        }
        
        if (user.armor <= 0) {
          warnings.push("⚠️ Armor kamu habis! Sangat berbahaya!");
        }
        
        if (user.sword <= 0) {
          warnings.push("⚠️ Sword kamu habis! Tidak bisa menyerang!");
        }
      }

      // Add current status bars
      let armorBar = createProgressBar(user.armordurability || 0, 100)
      let swordBar = createProgressBar(user.sworddurability || 0, 100)
      let healthBar = createProgressBar(user.health || 0, 200)
      let staminaBar = createProgressBar(user.stamina || 0, 200)

      resultMessage += `\n\n╭─「 👤 *STATUS TERKINI* 」
├ 🏆 *Level:* ${user.level || 1}
├ ❤️ *Health:* ${healthBar}
├ ⚡ *Stamina:* ${staminaBar}
├ 🥼 *Armor Lv.${user.armor || 0}:* ${user.armor > 0 ? armorBar : '💀 HANCUR'}
├ ⚔️ *Sword Lv.${user.sword || 0}:* ${user.sword > 0 ? swordBar : '💀 HANCUR'}
╰─────────────────────`

      // Combine all messages into one
      if (warnings.length > 0) {
        resultMessage += `\n\n⚠️ *PERINGATAN:*\n${warnings.join('\n')}`;
        if (warnings.some(w => w.includes('Health') || w.includes('Stamina')) && !isDead) {
          resultMessage += '\n\n💊 Ketik *.heal* untuk memulihkan Health/Stamina';
        }
        if (warnings.some(w => w.includes('hancur')) || user.armor <= 0 || user.sword <= 0) {
          resultMessage += '\n🔨 Ketik *.craft* untuk membuat equipment baru';
        }
        
        // Tambahan saran untuk craft gabungan jika kondisi kritis
        let missingAfterMission = checkMissingEquipment(user)
        if (missingAfterMission.length > 0) {
          resultMessage += `\n\n⚠️ *KONDISI KRITIS:* Health/Stamina rendah!\nSebaiknya craft ${missingAfterMission.join(" dan ")} sekaligus.`;
        }
      }

      // Tambahkan info cooldown
      resultMessage += `\n\n⏰ *COOLDOWN:* 1 jam sebelum bisa ambil misi lagi`

      let fkontak = {
        "key": {
          "participants": "0@s.whatsapp.net",
          "remoteJid": "status@broadcast",
          "fromMe": false,
          "id": "Halo"
        },
        "message": {
          "contactMessage": {
            "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
          }
        },
        "participant": "0@s.whatsapp.net"
      }

      conn.sendMessage(m.chat, { text: resultMessage }, { quoted: fkontak });

      user.lastmission = new Date * 1;
      clearTimeout(timeout);
      delete conn.mission[m.sender];
      return !0
      
    } else if (/^tolak?$/i.test(txt)) {
      // Set cooldown 1 menit untuk tolak
      conn.missionCooldown[m.sender] = {
        type: "menolak misi",
        endTime: Date.now() + (1 * 60 * 1000) // 1 menit
      }
      
      clearTimeout(timeout)
      delete conn.mission[m.sender]
      m.reply('❌ Misi Dibatalkan\n⏰ Cooldown: 1 menit')
      return !0
    }
  } catch (e) {
    console.error('Error in mission handler:', e)
    clearTimeout(timeout)
    delete conn.mission[m.sender]
    m.reply('❌ Error Saat Pengambilan Misi')
    return !0
  }
}

handler.help = ['mission']
handler.tags = ['rpg']
handler.command = /^(m(isi)?(ission)?)$/i

export default handler