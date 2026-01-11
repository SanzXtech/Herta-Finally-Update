import fs from "fs-extra";

let handler = async (m, { q, conn, isOwner, command, setReply }) => {
  const isImage = m.type === "imageMessage";
  const isVideo = m.type === "videoMessage";
  const isAudio = m.type == "audioMessage";
  const isViewOnce = m.type === "viewOnceMessage";
  const isQuotedImage = m.type === "extendedTextMessage" && m.content.includes("imageMessage");
  const isQuotedVideo = m.type === "extendedTextMessage" && m.content.includes("videoMessage");
  const isQuotedAudio = m.type === "extendedTextMessage" && m.content.includes("audioMessage");
  const isQuotedText = m.type === "extendedTextMessage" && m.content.includes("conversation");
  const isQuotedViewOnce = m.type === "extendedTextMessage" && m.content.includes("viewOnceMessage");

  if (!m.isGroup) return setReply(mess.only.group);
  if (!m.isAdmin && !isOwner) return m.reply(mess.only.admin);

  if (!isQuotedText && (isQuotedImage || isQuotedVideo || isImage || isVideo || isQuotedAudio || isAudio || isViewOnce || isQuotedViewOnce)) {
    let p = m.quoted ? m.quoted : m;
    let media;
    try {
      media = await p.download(true);
      if (!media) throw new Error('No media downloaded');
    } catch (error) {
      console.error('Error downloading media:', error);
      return m.reply('Failed to download media. Please try again.');
    }

    try {
      if (isQuotedImage || isImage) {
        let caption = m.quoted ? m.quoted.caption : q;
        conn.sendMessage(m.chat, {
          image: fs.readFileSync(media),
          caption,
        });
      } else if (isQuotedVideo || isVideo) {
        let caption = m.quoted ? m.quoted.caption : q;
        conn.sendMessage(m.chat, {
          video: fs.readFileSync(media),
          caption,
        });
      } else if (isQuotedAudio || isAudio) {
        conn.sendMessage(m.chat, {
          audio: fs.readFileSync(media),
          mimetype: "audio/mp4",
        });
      } else if (isViewOnce || isQuotedViewOnce) {
        let viewOnceMessage = m.message.viewOnceMessage || m.quoted.message.viewOnceMessage;
        let mediaType = viewOnceMessage.message.imageMessage ? 'image' : 'video';
        let caption = viewOnceMessage.message[mediaType + 'Message'].caption || q;

        conn.sendMessage(m.chat, {
          [mediaType]: fs.readFileSync(media),
          caption,
          viewOnce: true
        });
      }
    } catch (error) {
      console.error('Error sending media:', error);
      return m.reply('Failed to send media. Please try again.');
    }
  } else if (m.quoted && (m.quoted.mtype == "extendedTextMessage" || m.quoted.mtype == "conversation")) {
    conn.sendMessage(m.chat, { text: m.quoted.text });
  } else {
    conn.sendMessage(m.chat, { text: q ? q : "" });
  }
};

handler.tags = ["admin"];
handler.command = ["broadcast", "share"];
handler.group = true;
export default handler;
