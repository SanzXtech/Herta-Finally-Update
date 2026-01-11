import canvafy from "canvafy";
import axios from "axios";
  
let handler = async (m, { conn, usedPrefix, text, command }) => {
let input = `[!] *wrong input*
	
Ex : ${usedPrefix + command} kemarin `
	if (!text) return m.reply(input)
	
m.reply(wait)


const { name, artist, release_date, duration, image_url, dlink } = await spotifyDL.play(text);


    let captionvid = `\n• Title: ${name}\n• Artist: ${artist}\n• Duration: ${duration}\n• Rilis: ${release_date}\n\n${global.packName}`
const p = await new canvafy.Spotify()
            .setTitle(name)
            .setAuthor("Spotify Downloader")
            .setTimestamp(40, 100)
            .setOverlayOpacity(0.8)
            .setBorder("#fff", 0.8)
            .setImage(image_url)
            .setBlur(3)
            .build();

 let a = await conn.sendFile(m.chat, p, '', captionvid, m);
conn.sendMessage(m.chat, {audio: {url: dlink}, mimetype: 'audio/mpeg', ptt: false}, {quoted: a})
   
  }
handler.help = ['spotify <judul>']
handler.tags = ['downloader']
handler.command = /^(spotify)$/i
handler.limit = true
handler.register = true

export default handler

const spotifyDL = {
    dl: async (link) => {
        const spotlink = /^https:\/\/open\.spotify\.com\/.+$/;
        if (!spotlink.test(link)) {
            return {
                success: false,
                message: 'Link Spotify yang diinputkan tidak valid.',
            };
        }
        const url = `https://www.bhandarimilan.info.np/spotify?url=${encodeURIComponent(link)}`;
        const headers = {
            'authority': 'www.bhandarimilan.info.np',
            'accept': '*/*',
            'user-agent': 'Postify/1.0.0',
        };
        try {
            const { data } = await axios.get(url, { headers });
            if (!data.success) {
                throw new Error(`Terjadi kesalahan saat mengekstrak link ${link}`);
            }
            
            const { id, artists, title, album, cover, isrc, releaseDate } = data.metadata;
            return {
                success: true,
                metadata: { id, artists, title, album, cover, isrc, releaseDate },
                link: data.link,
            };
        } catch (error) {
            console.error(error.message);
            return {
                success: false,
                message: `Tidak dapat mengekstrak link Spotify ${link}`,
            };
        }
    },
    
    play: async (query) => {
        const url = `https://www.bhandarimilan.info.np/spotisearch?query=${encodeURIComponent(query)}`;
        try {
            const { data } = await axios.get(url);
            if (!data || !Array.isArray(data) || data.length === 0) {
                return {
                    success: false,
                    message: `Pencarian ${query} tidak ditemukan.`,
                };
            }
            
            const ft = data[0];
            const dlinfo = await spotifyDL.dl(ft.link);
            return {
                success: true,
                name: ft.name,
                artist: ft.artist,
                release_date: ft.release_date,
                duration: ft.duration,
                link: ft.link,
                image_url: ft.image_url,
                dlink: dlinfo.link,
            };
        } catch (error) {
            console.error(error.message);
            return {
                success: false,
                message: `Tidak dapat menemukan pencarian ${query}`,
            };
        }
    }
};
