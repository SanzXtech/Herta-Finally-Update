import fs from 'fs';
import path from 'path';

let handler = async (m, { args, setReply }) => {
  if (!args[0]) return setReply("❗ Masukkan nama fitur yang ingin dicari. Contoh: `.findfitur cekprem`");

  const fiturDicari = args[0].toLowerCase();
  const rootPath = './plugins'; // Sesuaikan dengan lokasi folder plugin Anda
  let hasil = [];

  // Fungsi untuk mencari file dalam folder tertentu
  function cariFitur(direktori, indent = 3, parentPath = 'plugins') {
    const fileList = fs.readdirSync(direktori);

    for (let file of fileList) {
      const filePath = path.join(direktori, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        const folderIcon = ' '.repeat(indent) + `╰┈➤ ${file}`;
        hasil.push(folderIcon); // Menambahkan folder ke hasil
        cariFitur(filePath, indent + 3, `${parentPath} / ${file}`); // Meningkatkan indentasi
      } else if (file.toLowerCase().includes(fiturDicari)) {
        if (!hasil.includes(parentPath)) hasil.unshift(parentPath); // Menampilkan folder utama hanya sekali
        const fileIcon = ' '.repeat(indent + 3) + `╰┈➤ ${file}`;
        hasil.push(fileIcon);
      }
    }
  }

  cariFitur(rootPath);

  if (hasil.length === 0) {
    return setReply(`❌ Fitur dengan nama *"${fiturDicari}"* tidak ditemukan.`);
  }

  let teks = `🔍 *HASIL PENCARIAN FITUR* 🔎\n\n${hasil.join('\n')}`;
  setReply(teks);
};

handler.help = ["findfitur <nama_fitur>"];
handler.tags = ["tools"];
handler.command = /^findfitur$/i;
handler.owner = true;

export default handler;
