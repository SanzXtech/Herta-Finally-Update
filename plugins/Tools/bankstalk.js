import axios from "axios";

let handler = async (m, { conn, usedPrefix, command, text }) => {
    if (!text) throw `Contoh: ${usedPrefix + command} 081234567890 dana`;

    let [text1, text2] = text.split(" ");
    if (!text1 || !text2) return m.reply('Format salah! Harap masukkan nomor rekening dan tipe bank.');

    try {
        let { data } = await stalkBank(text1, text2);
        
        if (!data) throw new Error("No Rek nya ga ada Wkwkwk.");

        let cap = `
*Stalker Bank*

*No Rekening:* ${data.account_number}
*Atas Nama:* ${data.name}
*Rekening Bank:* ${data.bank_code}
`;
        conn.reply(m.chat, cap.trim(), m);
    } catch (e) {
       console.log(e);
       m.reply('lagi error bang fitur nya :)');
    }
};

handler.help = ["bankstalk"];
handler.tags = ["stalker"];
handler.command = /^(bankstalk)$/i;
handler.limit = true;

export default handler;

async function stalkBank(rekening, bankType) {
    let { data: list } = await axios.get(`https://cek-rekening-three.vercel.app/api/list-bank`);
    if (!rekening) throw new Error("Mohon Masukkan Rekening Atau Nomor Bank");

    let listBank = list.data;
    const bank = listBank.find(b => b.bank_code === bankType);
    
    if (!bank) {
        throw new Error(
            `Bank Type tidak valid! Berikut daftar bank yang tersedia:\n${listBank
                .map(b => `${b.bank_code} - ${b.name}`)
                .join("\n")}`
        );
    }

    try {
        let { data: cek } = await axios.get(`https://cek-rekening-three.vercel.app/api/cek-rekening?bank_code=${bankType}&number=${rekening}`);
        return cek;
    } catch (error) {
        console.warn("[ WARNING ] Errors Found! " + error.message);
        throw new Error("Terjadi kesalahan saat memeriksa rekening.");
    }
}