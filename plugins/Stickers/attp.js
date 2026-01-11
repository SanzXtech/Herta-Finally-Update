let handler = async (m, {
    conn,
    text
}) => {
    if (!text[0]) return m.reply(`Contoh: .attp Nasirxml Nih Boss`)
    let teks = text ? text : m.quoted && m.quoted.text ? m.quoted.text : m.text
   
    let stiker = `https://tenor.googleapis.com/v2/render_dynamic_text?client_key=waffles&key=AIzaSyCbDgY_wZO9guZMktW6MnOGo-nKVFXqaUE&%24alt=proto&text=${encodeURIComponent(text)}&id=258698638&config.output_media_format=2&config.width=320&config.height=200&config.frames_per_second=20&config.composition_type=3`;
    await conn.sendFile(m.chat, stiker, 'sticker.webp', '', m)
};

handler.help = ['attp <teks>']
handler.tags = ['sticker']
handler.command = /^attp$/i
handler.limit = true
export default handler
