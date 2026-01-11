import { readdirSync, statSync } from 'fs';
import { join, parse } from 'path';
import fs from "fs-extra";

let handler = async (m, { q, conn, usedPrefix, command, args, text }) => {
    let pluginFiles = getPluginFiles("./plugins");
    if (!text) throw `Uhm.. teksnya mana?\n\nContoh:\n${usedPrefix + command} <tag/no> <nama_plugin>`;
    
    let who;
    if (m.isGroup) {
        who = m.mentionedJid[0] || m.quoted?.sender || args[0] + "@s.whatsapp.net";
    } else {
        who = args[0] + "@s.whatsapp.net";
    }
    
    if (!who) return m.reply(`Silakan tag/628****234`);

    const pluginName = args[1];
    const pluginPath = pluginFiles[pluginName];
    if (!pluginPath) {
        m.reply(`Plugin *${pluginName}* tidak ditemukan`);
        return;
    }
    
    let file = fs.readFileSync(pluginPath);
    let jpegThumbnail = fs.readFileSync("./media/thumbnaildokumen.jpg");
    let mimetype = "text/javascript";

    conn.sendMessage(
        who,
        { document: file, fileName: `${pluginName}.js`, mimetype, jpegThumbnail },{});
    
    await conn.reply(m.chat, 'Berhasil mengirim file ke @' + who.split('@')[0], m);
};

handler.help = ["sendplugin"].map((v) => v + " <teks>");
handler.tags = ["owner"];
handler.command = /^(sendplug)$/i;
handler.owner = true;

export default handler;

function getPluginFiles(folderPath) {
    let files = {};

    function getFilesRecursively(folderPath) {
        const items = readdirSync(folderPath);

        for (let item of items) {
            const itemPath = join(folderPath, item);
            const itemStat = statSync(itemPath);

            if (itemStat.isDirectory()) {
                getFilesRecursively(itemPath);
            } else if (item.endsWith(".js")) {
                const { name } = parse(item);
                files[name] = itemPath;
            }
        }
    }

    getFilesRecursively(folderPath);
    return files;
}