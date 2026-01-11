let handler = async (m, { conn }) => {
    // Use settings from settings.js when available
    const authorName = global.ownerName || global.authorName || 'Sanz | ᯤ 𓈆 2%';
    const botName = global.botName || global.namebot || 'Herta-V2';
    const ownerNumber = global.nomerOwner || global.ownerBot || '6281401689098';
    const email = global.ownerEmail || 'sanzonlyofficial@gmail.com';
    const website = global.myUrl || global.website || 'https://www.tiktok.com/@chopgt';
    const tiktok = global.tiktok || 'https://www.tiktok.com/@chopgt';

    const fakeContact = {
        displayName: `👑 ${authorName} (Owner)`,
        vcard: `BEGIN:VCARD\n` +
            `VERSION:3.0\n` +
            `N:${authorName};;;;\n` +
            `FN:${authorName} - Developer Bot\n` +
            `ORG:Sanz Inc;\n` +
            `TITLE:Founder & CEO\n` +
            `EMAIL;type=INTERNET:${email}\n` +
            `URL:${website}\n` +
            `TEL;type=WORK;waid=${ownerNumber}:+${ownerNumber}\n` +
            `ADR:;;Indonesia;;;;\n` +
            `X-SOCIALPROFILE;type=tiktok:${tiktok}\n` +
            `X-WA-BIZ-DESCRIPTION:🌟 Halo! Saya ${authorName}, Developer dari ${botName}.\n` +
            `🚀 Jika butuh bantuan atau ingin kerja sama, hubungi saya melalui WhatsApp atau cek website!\n` +
            `X-WA-BIZ-NAME:${authorName}\n` +
            `X-WA-BIZ-JID:${ownerNumber}@s.whatsapp.net\n` +
            `END:VCARD`
    };

    await conn.sendMessage(m.chat, {
        contacts: {
            displayName: fakeContact.displayName,
            contacts: [{ vcard: fakeContact.vcard }]
        },
        contextInfo: {
            forwardingScore: 999999,
            isForwarded: true,
            externalAdReply: {
                title: `✨ ${botName} || ${authorName}`,
                body: 'Developer & Owner Bot',
                thumbnailUrl: "https://files.catbox.moe/qz1wnx.jpg", // ✅ Gambar Profil Owner
                sourceUrl: website,
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    }, { quoted: m });

    await conn.reply(m.chat, `Hai @${m.sender.split('@')[0]}, ini ownerku 🐼💜`, m, { mentions: [m.sender] });
};

handler.help = ['owner', 'creator'];
handler.tags = ['info'];
handler.command = /^(owner|creator)$/i;

export default handler;
