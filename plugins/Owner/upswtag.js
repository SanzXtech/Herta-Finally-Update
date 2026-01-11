import { generateWAMessage, STORIES_JID, generateWAMessageFromContent } from 'baileys';
import { fileTypeFromBuffer } from 'file-type';

let handler = async (m, { conn, text }) => {
    try {
        const sendStatusMention = async (content, groupData, statusJidList) => {
            let success = 0, failed = 0, index = 0;

            if (!content.image && !content.video && !content.audio && !content.text) {
                throw new Error("Media or text content is missing.");
            }

            const media = await generateWAMessage(STORIES_JID, content, {
                upload: conn.waUploadToServer,
            });

            const groupStages = itemStages(groupData);

            for (const groupId of groupStages) {
                const additionalNodes = [{
                    tag: "meta",
                    attrs: {},
                    content: [{
                        tag: "mentioned_users",
                        attrs: {},
                        content: groupId.map((jid) => ({
                            tag: "to",
                            attrs: { jid },
                            content: undefined,
                        })),
                    }],
                }];

                await conn.relayMessage(STORIES_JID, media.message, {
                    messageId: media.key.id,
                    statusJidList,
                    additionalNodes,
                });

                for (const jid of groupId) {
                    try {
                         await conn.sendMessage(jid, { text: '' }, {
          quoted: media,
          ephemeralExpiration: 86400
        });
        
                        const msg = await generateWAMessageFromContent(jid, {
                            statusMentionMessage: {
                                message: {
                                    protocolMessage: {
                                        key: media.key,
                                        type: 25,
                                    },
                                },
                            },
                        }, {});

                        await conn.relayMessage(jid, msg.message, {
                            additionalNodes: [{
                                tag: "meta",
                                attrs: { is_status_mention: "true" },
                                content: undefined,
                            }],
                        });
                        success++;
                    } catch (error) {
                        failed++;
                    }

                    index++;
                    const delay = (index % 10 === 0) ? 30000 : 3000;
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
            return { success, failed };
        };

        if (m.quoted && (/audioMessage|videoMessage|imageMessage|conversation|extendedTextMessage/.test(m.quoted.mtype))) {
            const groups = Object.values(await conn.groupFetchAllParticipating())
                .filter(v => v.participants.find(p => p.id == conn.user.jid) && !v.announce);
            let groupData = [];
            let statusJidList = [];

            const isAll = text.includes("--all");
            const isOnly = text.includes("--only");
            const onlyId = isOnly ? text.split("--only")[1].trim() : null;

            if (isAll) {
                groupData = groups.map(x => x.id);
                statusJidList = groups.flatMap(group => group.participants.map(v => v.id));
                text = text.replace("--all", "").trim();
            } else if (isOnly && onlyId) {
                groupData = [onlyId];
                const group = groups.find(g => g.id === onlyId);
                statusJidList = group ? group.participants.map(v => v.id) : [];
                text = text.replace(`--only ${onlyId}`, "").trim();
            } else {
                groupData = [m.chat]; // Send to current group if no flags are present
                const group = groups.find(g => g.id === m.chat);
                statusJidList = group ? group.participants.map(v => v.id) : [];
            }

            if (groupData.length === 0 || statusJidList.length === 0) {
                return m.reply('Mana Type nya?\n\n*Contoh:*\n.upswtag <caption> --only <idgc>\n.upswtag --all <caption>');
            }

            const caption = (text || '#UP STATUS DARI BOT');
           
            let media;

            const content = { caption };

            try {
                media = await m.quoted.download();
                if (!media) {
                    return m.reply('Media gagal diunduh. Pastikan media valid.');
                }
            } catch (error) {
                return m.reply('Terjadi kesalahan saat mengunduh media.');
            }

            const mime = await fileTypeFromBuffer(media);

            if (mime) {
                console.log("Tipe MIME terdeteksi:", mime);
                if (/image/.test(mime.mime)) {
                    content.image = media;
                    content.mimetype = mime.mime || 'image/jpeg';
                } else if (/video/.test(mime.mime)) {
                    content.video = media;
                    content.mimetype = mime.mime || 'video/mp4';
                } else if (/audio/.test(mime.mime)) {
                    content.audio = media;
                    content.ptt = true;
                    content.mimetype = mime.mime || 'audio/mpeg';
                } else {
                    return m.reply(`Tipe media tidak didukung. MIME type: ${mime.mime}`);
                }
            } else {
                return m.reply('Tipe media tidak terdeteksi. Pastikan media memiliki tipe yang valid.');
            }

            const { success, failed } = await sendStatusMention(content, groupData, statusJidList);

            conn.reply(m.chat, `Berhasil mengirim cerita ke ${statusJidList.length} user di ${groupData.length} grup.\nSuccess: ${success}${failed > 0 ? '\nFailed: ' + failed : ''}`, m, {
                expiration: 86400
            });
        } else {
            m.reply('Input media yang ingin dijadikan story.');
        }
    } catch (error) {
        console.error(error);
        m.reply('Terjadi kesalahan:\n' + error.message);
    }
};

handler.help = handler.command = ["upswtag"];
handler.tags = ["group"];
handler.owner = true;
handler.rowner = true;

export default handler;

function itemStages(itemArray) {
    const hasil = [];
    for (let index = 0; index < itemArray.length; index += 5) {
        const stage = itemArray.slice(index, index + 5);
        hasil.push(stage);
    }
    return hasil;
              }