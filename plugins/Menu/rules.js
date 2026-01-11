import fs from 'fs'

let handler = async (m, { conn }) => {
	let rules = `_*Kebijakan Privasi, Syarat Ketentuan dan Peraturan Bot*_

*Kebijakan Privasi*
_1. Bot tidak akan menyebarkan nomor users._
_2. Bot tidak akan menyimpan media yang dikirimkan oleh users._
_3. Owner berhak melihat data riwayat chat users._
_4. Owner dapat melihat riwayat chat, dan media yang dikirimkan users._

*Peraturan Bot*
_1. Users dilarang menelfon maupun video call nomor bot._
_2. Users dilarang mengirimkan berbagai bug, virtex, dll ke nomor bot._
_3. Users diharap tidak melakukan spam dalam penggunaan bot._
_4. Users dilarang menambahkan nomor bot secara illegal, untuk menambahkan silahkan hubungi owner._
_5. Users dilarang melakukan spam terhadap bot secara terus menerus, sangsi ban permanent._

*Syarat Ketentuan Bot*
_1. Bot *tidak akan bertanggungjawab atas apapun yang users lakukan terhadap fitur bot.*_
_2. Owner akan memberikan hukuman: block atau ban terhadap users yang melanggar peraturan._

*Note:*
_1. Jika ada yang menjual/beli/sewa bot atas nomor ini, harap segera hubungi owner!_
_2. Jika ada bug atau error pada fitur bot, saya mohon untuk lapor kepada owner._
_2. Jika ingin donasi bisa langsung saja ketik /donasi_
_3. Ketik /sewa jika ingin menyewa bot ini._

_Perlu kalian tahu bahwa kami menjaga privasi dari data-data anda!_

*────────────────────────*
`;
	conn.sendMessage(m.chat, {
text: transformText(rules),
contextInfo: {
externalAdReply: {
title: "Rules Herta-V2",
body: 'Mohon DiPatuhi Agar Menghindar Dari Banned',
thumbnailUrl: 'https://telegra.ph/file/3aa1d699bde0c8702018b.jpg',
sourceUrl: "",
mediaType: 1,
renderLargerThumbnail: true
}
},rules: rules},{quoted: m })
}
handler.help = ['rules']
handler.tags = ['main']
handler.command = /^(rules|rule)$/i;

export default handler;
