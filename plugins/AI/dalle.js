let handler = async (m, { q, conn, args, usedPrefix, command }) => {
  try {
    if (!q) {
      return m.reply(
        `Please provide a description to generate an AI image.\n\nExample:\n${usedPrefix}${command} a futuristic city, cyberpunk`
      );
    }
    m.reply('Generating your image using DALL-E, please wait...');

    let url = `${global.apiUrl}/dalle?text=${encodeURIComponent(q)}`;
    await conn.sendMessage(
      m.chat,
      { image: { url }, caption: `Generated image based on your description: *${q}*.\nEnjoy your AI creation!` },
      { quoted: m }
    );
  } catch (err) {
    m.reply(`An error occurred: ${err}`);
  }
};

handler.help = ["dalle"];
handler.tags = ["ai"];
handler.command = ["dalle", "dallegenerate"];
export default handler;