let handler = async (m, { q, conn, args, usedPrefix, command }) => {
  try {
    if (!q) {
      return m.reply(
        `Please provide a description to generate images.\n\n*Example:*\n${usedPrefix}${command} pixelart, anime`
      );
    }
    m.reply('Generating multiple images, please wait...');

    let apiUrl = `${global.apiUrl}/bingimg?text=${encodeURIComponent(q)}`;
    let response = await fetch(apiUrl);
    if (!response.ok) throw `Failed to access API. Status: ${response.status}`;
    
    let json = await response.json();
    if (!json.status || !json.result.length) throw `No images generated for: *${q}*`;

    for (let i = 0; i < json.result.length; i++) {
      await conn.sendMessage(
        m.chat,
        { image: { url: json.result[i] }, caption: `Generated image ${i + 1} based on: *${q}*` },
        { quoted: m }
      );
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Delay 1 second
    }
  } catch (err) {
    m.reply(`An error occurred: ${err}`);
  }
};

handler.help = ["bingimage"];
handler.tags = ["ai"];
handler.command = ["bingimage", "bingimg"];
export default handler;