let handler = async (m, { q, conn, args, usedPrefix, command }) => {
  try {
    if (!q) {
      return m.reply(
        `Please provide a query to perform a search.\n\nExample:\n${usedPrefix}${command} Best programming resources`
      );
    }
    m.reply('Fetching results, please wait...');
    
    let url = `${global.apiUrl}/bingai/search?text=${encodeURIComponent(q)}`;
    let response = await fetch(url);
    if (!response.ok) throw `Failed to fetch results. Status: ${response.status}`;
    
    let json = await response.json();
    if (!json.status || !json.result.ai_response) throw `No results found for: *${q}*`;

    // Build output message
    let result = `🔍 *Search Results for:* *${q}*\n\n`;
    result += `${json.result.ai_response}\n\n`;

    // Displaying search results with links
    if (json.result.search_results?.length) {
      result += `🌐 *Top Search Links:*\n`;
      json.result.search_results.forEach((link, idx) => {
        result += `${idx + 1}. [Link ${link.index}](${link.url})\n`;
      });
    }

    // Additional web search results with titles and snippets
    if (json.result.web_search_results?.length) {
      result += `\n*Related Articles and Websites:*\n`;
      json.result.web_search_results.forEach((webResult) => {
        result += `🔗 [${webResult.title}](${webResult.url})\n  - ${webResult.snippets.join(' ')}\n\n`;
      });
    }

    await m.reply(result.trim());
  } catch (err) {
    m.reply(`An error occurred: ${err}`);
  }
};

handler.help = ["bingsearch"];
handler.tags = ["internet"];
handler.command = ["bingsearch"];
export default handler;