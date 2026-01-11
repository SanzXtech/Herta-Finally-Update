let handler = m => m
handler.before = async function(m, { conn }) {
    let id = m.chat
    
    conn.math = conn.math ? conn.math : {}
    
    if (id in conn.math) {
        let math = JSON.parse(JSON.stringify(conn.math[id][1]))
        
        if (parseInt(m.body) === math.result) {
            db.data.users[m.sender].exp += math.bonus
            clearTimeout(conn.math[id][3])
            delete conn.math[id]
            m.reply(`✅ *Benar!*\n+${math.bonus} XP`)
        } 
        // Remove the line below to not reply 'salah'
        // else if (/^-?[0-9]+(\.[0-9]+)?$/.test(m.body)) m.reply('salah');
    }
}
export default handler