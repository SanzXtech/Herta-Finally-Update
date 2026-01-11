import axios from "axios";
import cheerio from "cheerio";

let handler = async (m, {
    conn,
    usedPrefix,
    command,
    text
}) => {
    if (!text) throw `Contoh: ${usedPrefix + command} username`;

    try {
        let data = await tiktokStalk(text);
        
        let caption = '';
        caption += `*∘ Name :* ${data.userInfo.nama}\n`;
        caption += `*∘ Username :* ${data.userInfo.username}\n`;
        caption += `*∘ Bio :* ${data.userInfo.bio}\n`;
        caption += `*∘ Followers :* ${data.userInfo.totalfollowers}\n`;
        caption += `*∘ Mengikuti :* ${data.userInfo.totalmengikuti}\n`;
        caption += `*∘ Like :* ${data.userInfo.totaldisukai}\n`;
        caption += `*∘ Video :* ${data.userInfo.totalvideo}\n`;
        caption += `*∘ Teman :* ${data.userInfo.totalteman}\n`;
        caption += `*∘ ID :* ${data.userInfo.id}\n`;
        
        await conn.relayMessage(m.chat, {
            extendedTextMessage: {
                text: caption,
                contextInfo: {
                    externalAdReply: {
                        title: `https://www.tiktok.com/@${data.userInfo.username}`,
                        body: '',
                        mediaType: 1,
                        previewType: 0,
                        renderLargerThumbnail: true,
                        thumbnailUrl: data.userInfo.avatar,
                        sourceUrl: null
                    }
                },
                mentions: [m.sender]
            }
        }, { quoted: m });
        
    } catch (e) {
        throw e;
    }
};

handler.help = ["ttstalk", "tiktokstalk"];
handler.tags = ["stalker"];
handler.command = /^(ttstalk|tiktokstalk)$/i;
handler.limit = true;

export default handler;

async function tiktokStalk(username) {
    try {
        const response = await axios.get(`https://www.tiktok.com/@${username}?_t=ZS-8tHANz7ieoS&_r=1`);
        const html = response.data;
        const $ = cheerio.load(html);
        const scriptData = $('#__UNIVERSAL_DATA_FOR_REHYDRATION__').html();
        const parsedData = JSON.parse(scriptData);

        const userDetail = parsedData.__DEFAULT_SCOPE__?.['webapp.user-detail'];
        if (!userDetail) {
            throw new Error('User tidak ditemukan');
        }

        const userInfo = userDetail.userInfo?.user;
        const stats = userDetail.userInfo?.stats;

        const metadata = {
            userInfo: {
                id: userInfo?.id || null,
                username: userInfo?.uniqueId || null,
                nama: userInfo?.nickname || null,
                avatar: userInfo?.avatarLarger || null,
                bio: userInfo?.signature || null,
                verifikasi: userInfo?.verified || false,
                totalfollowers: stats?.followerCount || 0,
                totalmengikuti: stats?.followingCount || 0,
                totaldisukai: stats?.heart || 0,
                totalvideo: stats?.videoCount || 0,
                totalteman: stats?.friendCount || 0,
            }
        };

        return metadata;

    } catch (error) {
        throw new Error(error.message);
    }
}