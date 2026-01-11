import fs from "fs-extra";
async function autoClearSession() {
  try {
    const sessionPath = `./${global.session}`;
    const files = await fs.readdir(sessionPath);

    // Filter file sampah, kecuali creds.json dan sesi utama
    const filteredArray = files.filter(
      (item) =>
        (item.startsWith("pre-key") || 
         item.startsWith("sender-key") || 
         item.startsWith("session-")) && 
        item !== "creds.json"
    );

    console.log(`Total file sesi: ${files.length}`);
    console.log(`Terdeteksi ${filteredArray.length} file sampah`);

    // Jika jumlah file sampah lebih dari threshold
    if (filteredArray.length >= 1000) {
      console.log("Menghapus file sampah session...");

      for (const file of filteredArray) {
        try {
          await fs.unlink(`${sessionPath}/${file}`);
        } catch (err) {
          console.warn(`Gagal menghapus file ${file}: ${err.message}`);
        }
      }

      console.log("Berhasil menghapus semua sampah di folder session.");
    }
  } catch (err) {
    console.error("Terjadi kesalahan saat scan folder session:", err.message);
  }
}

// Interval cek setiap 4 jam
setInterval(() => autoClearSession(), 1 * 60 * 1000);
