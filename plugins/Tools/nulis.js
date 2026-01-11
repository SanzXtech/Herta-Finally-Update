import { format } from 'util'

import { spawn } from 'child_process'


let fontPath = 'src/font/Zahraaa.ttf'
let handler = async (m, { conn, args }) => {
    if (!global.support.convert &&
        !global.support.magick &&
        !global.support.gm) return handler.disabled = true // Disable if doesnt support
    if (!args.length) {
        return m.reply('Contoh penggunaan:\n.nulis Ini adalah contoh teks yang akan ditulis.')
    }
    let inputPath = 'src/kertas/magernulis1.jpg'
    let d = new Date()
    let tgl = d.toLocaleDateString('id-Id')
    let hari = d.toLocaleDateString('id-Id', { weekday: 'long' })
    let teks = args.join` `
    let wrappedText = teks.split(' ').reduce((lines, word) => {
        let currentLine = lines[lines.length - 1];
        if ((currentLine + ' ' + word).length > 60) {
            lines.push(word); // Start a new line if the current line exceeds 60 characters
        } else {
            lines[lines.length - 1] = currentLine + ' ' + word; // Append the word to the current line
        }
        return lines;
    }, ['']).join('\n'); // Join lines with newline characters
    let bufs = []
    const [_spawnprocess, ..._spawnargs] = [...(global.support.gm ? ['gm'] : global.support.magick ? ['magick'] : []),
        'convert',
        inputPath,
        '-font',
        fontPath,
        '-size',
        '1024x784',
        '-pointsize',
        '20',
        '-interline-spacing',
        '1',
        '-annotate',
        '+806+78',
        hari,
        '-font',
        fontPath,
        '-size',
        '1024x784',
        '-pointsize',
        '18',
        '-interline-spacing',
        '1',
        '-annotate',
        '+806+102',
        tgl,
        '-font',
        fontPath,
        '-size',
        '1024x784',
        '-pointsize',
        '20',
        '-interline-spacing',
        '-7.5',
        '-annotate',
        '+344+142',
        wrappedText, // Use wrapped text
        'jpg:-'
    ]
    spawn(_spawnprocess, _spawnargs)
        .on('error', e => m.reply(format(e)))
        .on('close', () => {
            conn.sendFile(m.chat, Buffer.concat(bufs), 'nulis.jpg', 'Hati² ketahuan:v', m)
        })
        .stdout.on('data', chunk => bufs.push(chunk))
}
handler.help = ['n'].map(v => v + 'ulis <teks>')
handler.tags = ['nulis']
handler.command = /^nulis$/i
handler.limit = true

                                                           
export default handler
