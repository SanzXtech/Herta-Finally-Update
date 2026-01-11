async function handler(m, { command, usedPrefix, conn }) {
    command = command.toLowerCase()
    this.anonymous = this.anonymous || {}

    const fkontak = {
        key: {
            participants: '0@s.whatsapp.net',
            remoteJid: 'status@broadcast',
            fromMe: false,
            id: 'Halo'
        },
        message: {
            contactMessage: {
                displayName: 'Anonymous Chat',
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;Anonymous;;;\nFN:Anonymous\nitem1.TEL;waid=0:0\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
            }
        },
        participant: '0@s.whatsapp.net'
    }

    let footer = `\n_Ketik ${usedPrefix}next untuk lanjut_\n_Ketik ${usedPrefix}leave untuk keluar_\n_Ketik ${usedPrefix}sendkontak untuk mengirim kontak_`

    let currentRoom = Object.values(this.anonymous).find(room => room.check(m.sender))

    if (command === 'leave') {
        if (!currentRoom) {
            return conn.sendMessage(m.chat, { text: `Kamu tidak sedang berada di anonymous chat\n${footer}` }, { quoted: fkontak })
        }
        let other = currentRoom.other(m.sender)
        await conn.sendMessage(m.chat, { text: `Kamu meninggalkan chat.\n${footer}` }, { quoted: fkontak })
        if (other) await conn.sendMessage(other, { text: `Partner meninggalkan chat.\n${footer}` }, { quoted: fkontak })
        delete this.anonymous[currentRoom.id]
        return
    }

    if (command === 'next') {
        if (!currentRoom) {
            return conn.sendMessage(m.chat, { text: `Kamu tidak sedang berada di anonymous chat\n${footer}` }, { quoted: fkontak })
        }
        let other = currentRoom.other(m.sender)
        if (other) await conn.sendMessage(other, { text: `Partner meninggalkan chat.\n${footer}` }, { quoted: fkontak })
        delete this.anonymous[currentRoom.id]
        // lanjut ke start
    }

    if (command === 'start' || command === 'next') {
        if (Object.values(this.anonymous).find(room => room.check(m.sender))) {
            return conn.sendMessage(m.chat, { text: `Kamu masih berada di dalam anonymous chat, menunggu partner.\n${footer}` }, { quoted: fkontak })
        }

        let room = Object.values(this.anonymous).find(room => room.state === 'WAITING' && !room.check(m.sender))
        if (room) {
            room.b = m.sender
            room.state = 'CHATTING'
            await conn.sendMessage(room.a, { text: `Partner ditemukan!\n${footer}` }, { quoted: fkontak })
            await conn.sendMessage(room.b, { text: `Partner ditemukan!\n${footer}` }, { quoted: fkontak })
        } else {
            let id = +new Date
            this.anonymous[id] = {
                id,
                a: m.sender,
                b: '',
                state: 'WAITING',
                check(who = '') {
                    return [this.a, this.b].includes(who)
                },
                other(who = '') {
                    return who === this.a ? this.b : who === this.b ? this.a : ''
                }
            }
            await conn.sendMessage(m.chat, { text: `Menunggu partner...\n${footer}` }, { quoted: fkontak })
        }
    }
}

handler.help = ['start', 'leave', 'next']
handler.tags = ['anonymous']
handler.command = ['start', 'leave', 'next']
handler.group = true

export default handler