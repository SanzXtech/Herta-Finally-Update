import fs from 'fs';
async function cleanSessionFiles() {
    fs.readdir("./session", async function (err, files) {
        if (err) {
            console.log('Unable to scan directory: ' + err);
            return;
        }
        let filteredArray = files.filter(item => 
            item.startsWith("pre-key") ||
            item.startsWith("sender-key") || 
            item.startsWith("session-")
        );
        
        console.log(`Terdeteksi ${filteredArray.length} file sampah`);
        let teks = `Terdeteksi ${filteredArray.length} file sampah\n\n`;
        if (filteredArray.length === 0) {
            console.log(teks);
            return;
        }
        console.log(teks);

        await sleep(2000);
        console.log("Menghapus file sampah session");
        
        filteredArray.forEach(function (file) {
            fs.unlinkSync(`./session/${file}`);
        });

        await sleep(2000);
        console.log("Berhasil menghapus semua sampah di folder session");
    });
}
//Clearsesi setiap 1 jam
setInterval(cleanSessionFiles, 60 * 60 * 1000);
