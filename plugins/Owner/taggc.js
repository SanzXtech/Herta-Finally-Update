let handler = async (m, {conn, text, usedPrefix, command}) => {
    // Tambahkan pengecekan awal untuk quoted
    if (!m.quoted && !text) return m.reply(`Masukkan teks untuk status atau reply gambar/video dengan caption`);
    
    let media = null;
    let options = {};
    const jids = [m.sender, m.chat];
    
    // Tambahkan pengecekan quoted secara eksplisit
    if (m.quoted) {
        const mime = m.quoted.mtype || m.quoted.mediaType;
        if (mime.includes('image')) {
            media = await m.quoted.download();
            options = {
                image: media,
                caption: text || m.quoted.text || '',
            };
        } else if (mime.includes('video')) {
            media = await m.quoted.download();
            options = {
                video: media,
                caption: text || m.quoted.text || '',
            };
        } else {
            options = {
                text: text || m.quoted.text || '',
            };
        }
    } else {
        options = {
            text: text,
        };
    }
    
    return conn.sendMessage("status@broadcast", options, {
        backgroundColor: "#7ACAA7",
        textArgb: 0xffffffff,
        font: 1,
        statusJidList: await (await conn.groupMetadata(m.chat)).participants.map((a) => a.id),
        additionalNodes: [
            {
                tag: "meta",
                attrs: {},
                content: [
                    {
                        tag: "mentioned_users",
                        attrs: {},
                        content: jids.map((jid) => ({
                            tag: "to",
                            attrs: { jid: m.chat },
                            content: undefined,
                        })),
                    },
                ],
            },
        ],
    });
}

handler.command = /^(taggc)$/i
handler.owner = true
export default handler