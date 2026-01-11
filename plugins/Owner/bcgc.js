import fs from 'fs-extra';
const { generateWAMessageFromContent, prepareWAMessageMedia, proto } = require("baileys");

let handler = async (m, { q, conn, isOwner, setReply, args, usedPrefix, command }) => {
  if (!isOwner && !m.itsMe) return setReply(mess.only.ownerB);
  if (!q) return setReply('Teksnya?');

  // Mengambil semua grup yang diikuti
  let getGroups = await conn.groupFetchAllParticipating();
  let groups = Object.entries(getGroups).slice(0).map(entry => entry[1]);
  let groupIds = groups.map(v => v.id);

  // Memeriksa apakah ada media yang di-quote atau media langsung
  const isImage = (m.type === 'imageMessage');
  const isQuotedImage = m.type === 'extendedTextMessage' && m.content.includes('imageMessage');
  const isVideo = (m.type === 'videoMessage');
  const isQuotedVideo = m.type === 'extendedTextMessage' && m.content.includes('videoMessage');
  const isQuotedAudio = m.type === 'extendedTextMessage' && m.content.includes('audioMessage');
  const quoted = m.quoted ? m.quoted : m.msg === undefined ? m : m.msg;

  let mediaPath;
  if (isQuotedImage || isImage || isQuotedAudio || isVideo || isQuotedVideo) {
    try {
      mediaPath = await conn.downloadAndSaveMediaMessage(quoted, makeid(5));
    } catch (error) {
      console.error('Error mendownload media:', error);
      return setReply('Gagal mendownload media.');
    }
  }

  setReply(`Mengirim Broadcast ke ${groupIds.length} grup, estimasi waktu selesai ${groupIds.length * 0.5} detik.`);

  for (let groupId of groupIds) {
    try {
      let text = `${q.replace('-tag', '')}`;
      let mem = [];
      // Siapkan media jika ada
      let media = mediaPath ? await prepareWAMessageMedia({ image: fs.readFileSync(mediaPath) }, { upload: conn.waUploadToServer }) : {};

      // Buat pesan dengan tombol
      let msg = generateWAMessageFromContent(
        groupId,
        {
          viewOnceMessage: {
            message: {
              messageContextInfo: {
                deviceListMetadata: {},
                deviceListMetadataVersion: 2,
              },
              interactiveMessage: proto.Message.InteractiveMessage.create({
                contextInfo: {
                  isForwarded: true,
                },
                body: proto.Message.InteractiveMessage.Body.create({
                  text: text,
                }),
                footer: proto.Message.InteractiveMessage.Footer.create({
                  text: "",
                }),
                header: proto.Message.InteractiveMessage.Header.create({
                  title: "",
                  subtitle: "",
                  hasMediaAttachment: !!mediaPath,
                  ...(media),
                }),
                nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                  buttons: [
                    {
                      name: "cta_url",
                      buttonParamsJson:
                        '{"display_text":"Owner","url":"https://wa.me/6281401689098","merchant_url":"https://wa.me/+6281401689098"}',
                    },
                    {
                      name: "cta_url",
                      buttonParamsJson:
                        '{"display_text":"Informasi","url":"https://whatsapp.com/channel/0029VafEhDUIXnlyGgMSgH2u","merchant_url":"https://whatsapp.com/channel/0029VafEhDUIXnlyGgMSgH2u"}',
                    },
                    {
                      name: "cta_url",
                      buttonParamsJson:
                        '{"display_text":"Testimoni","url":"https://whatsapp.com/channel/0029VarJDwv6hENsNYnalc1P","merchant_url":"https://whatsapp.com/channel/0029VarJDwv6hENsNYnalc1P"}',
                    },
                  ],
                }),
              }),
            },
          },
        },
        {}
      );

      // Mengirim pesan ke grup
      await conn.relayMessage(groupId, msg.message, {
        messageId: msg.key.id,
      });

      // Delay 3 detik sebelum mengirim ke grup berikutnya
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      console.error(`Gagal mengirim broadcast ke grup ${groupId}:`, error);
    }
  }

  setReply(`Sukses Mengirim Broadcast ke ${groupIds.length} grup.`);
};

handler.help = ["d"];
handler.tags = ["owner"];
handler.command = ['bcgc'];
export default handler;
