let handler = async (m, { conn, q, setReply, isOwner, args, prefix, command }) => {
    // Ambil pengaturan dari database
    let settings = db.data.settings["settingbot"];
    let setmenu = settings.setmenu; // Variabel ini sekarang fleksibel karena hanya membaca properti.

    // Cek argumen pertama dari input
    if (args[0] === 'katalog' || args[0] === 'product') {
        settings.setmenu = "katalog";
        setReply(`Berhasil mengubah tampilan menu ke katalog`);
    } else if (args[0] === 'image' || args[0] === 'img') {
        settings.setmenu = "image";
        setReply(`Berhasil mengubah tampilan menu ke image`);
    } else if (args[0] === 'document') {
        settings.setmenu = "document";
        setReply(`Berhasil mengubah tampilan menu ke document`);
   } else if (args[0] === 'docImage') {
        settings.setmenu = "docImage";
        setReply(`Berhasil mengubah tampilan menu ke docImg`);
    } else if (args[0] === 'gif') {
        settings.setmenu = "gif";
        setReply(`Berhasil mengubah tampilan menu ke gif`);
    } else if (args[0] === 'thumbnail') {
        settings.setmenu = "thumbnail";
        setReply(`Berhasil mengubah tampilan menu ke thumbnail`);
    } else if (args[0] === 'payment') {
        settings.setmenu = "payment";
        setReply(`Berhasil mengubah tampilan menu ke payment`);
    } else if (args[0] === 'button') {
        settings.setmenu = "button";
        setReply(`Berhasil mengubah tampilan menu ke button`);
    } else if (args[0] === 'livelocation') {
        settings.setmenu = "livelocation";
        setReply(`Berhasil mengubah tampilan menu ke livelocation`);
    } else if (args[0] === 'toko') {
        settings.setmenu = "toko";
        setReply(`Berhasil mengubah tampilan menu ke toko`);
    } else if (!q) {
        setReply(`Silakan pilih salah satu:

┌  • gif
│  • katalog
│  • thumbnail 
│  • livelocation
│  • document
│  • docImage
│  • image
└  • payment

Contoh: ${prefix + command} image`);
    } else {
        setReply("Perintah menu tidak ditemukan");
    }
};

handler.help = ["setmenu"];
handler.tags = ["owner"];
handler.command = ["setmenu"];
handler.owner = true;

export default handler
