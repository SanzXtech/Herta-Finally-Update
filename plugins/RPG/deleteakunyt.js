let handler = async (m, { conn, command, args, usedPrefix }) => {
    let user = global.db.data.users[m.sender];

    try {
        if (command === 'deleteakunyt') {
            if (!user.youtube_account) {
                return m.reply("Anda belum memiliki akun YouTube yang dapat dihapus.");
            } else {
                delete user.youtube_account;
                user.subscribers = 0; // Reset subscriber count
                user.like = 0; // Reset like count
                user.viewers = 0; // Reset viewers count
                user.playButton = 0; // Reset playButton count
                return m.reply("_Akun YouTube Anda berhasil dihapus dan jumlah subscribers, like, viewers dan PlayButton Anda telah direset._");
            }
        } else {
            return await m.reply("Perintah tidak dikenali. Gunakan perintah *deleteakunyt* untuk menghapus akun YouTube Anda.");
        }
    } catch (err) {
        m.reply("Error\n\n\n" + err.stack);
    }
};

handler.help = ['deleteakunyt'];
handler.tags = ['rpg'];
handler.command = /^(deleteakunyt)$/i;
handler.register = true;
handler.group = true;

export default handler;