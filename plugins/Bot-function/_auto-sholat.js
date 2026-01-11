import fetch from "node-fetch"

export async function before(m) {
    this.autosholat = this.autosholat ? this.autosholat : {}
    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? this.user.jid : m.sender
    let id = m.chat
    if (id in this.autosholat) {
        return false
    }

    try {
        let data = await (await fetch("https://api.aladhan.com/v1/timingsByCity?city=Makassar&country=Indonesia&method=8")).json();
        let jadwalSholat = data.data.timings;

        const date = new Date((new Date).toLocaleString("en-US", {
            timeZone: "Asia/Jakarta"
        }));
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const timeNow = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;

        for (const [sholat, waktu] of Object.entries(jadwalSholat)) {
            if (timeNow === waktu) {
                let caption = `Hai kak @${who.split('@')[0]},\nWaktu *${sholat}* telah tiba, ambilah air wudhu dan segeralah shalat🙂.\n\n*${waktu}*\n_untuk wilayah Jakarta dan sekitarnya_`
                this.autosholat[id] = [
                    this.reply(m.chat, caption, null, {
                        contextInfo: {
                            mentionedJid: [who]
                        }
                    }),
                    setTimeout(() => {
                        delete this.autosholat[id]
                    }, 57000)
                ]
            }
        }
    } catch (error) {
        console.error("Gagal mengambil data jadwal salat:", error)
    }
}

export const disabled = false
