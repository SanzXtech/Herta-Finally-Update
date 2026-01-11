import fs from 'fs-extra';
import toMs from 'ms';
import moment from 'moment-timezone';

// Time to open group
const open = (name, id, clock, _dir) => {
    let position = null;
    Object.keys(_dir).forEach((i) => {
        if (_dir[i].id === id) {
            position = i;
        }
    });

    if (_dir[position] && position !== null) {
        if (_dir[position].opened) _dir[position].opened = false;
        _dir[position].timeOpen = clock;
        _dir[position].id = id;
    } else {
        let obj = {
            name: name,
            id: id,
            opened: false,
            closed: false,
            timeOpen: clock,
            timeClose: ''
        };
        _dir.push(obj);
    }
};

// Time to close group
const close = (name, id, clock, _dir) => {
    let position = null;
    Object.keys(_dir).forEach((i) => {
        if (_dir[i].id === id) {
            position = i;
        }
    });

    if (_dir[position] && position !== null) {
        if (_dir[position].closed) _dir[position].closed = false;
        _dir[position].timeClose = clock;
        _dir[position].id = id;
    } else {
        let obj = {
            name: name,
            id: id,
            opened: false,
            closed: false,
            timeOpen: '',
            timeClose: clock
        };
        _dir.push(obj);
    }
};

// Time for open/close group
const running = async (_dir) => {
    let setTime = db.data.others['setTime'];
    if (!setTime) db.data.others['setTime'] = [];

    if (setTime.length > 0) {
        setInterval(async () => {
            const time = moment().tz('Asia/Jakarta').format('HH:mm');

            for (let i of setTime) {
                const warningTimeOpen = moment(i.timeOpen, 'HH:mm').subtract(5, 'minutes').format('HH:mm');
                const warningTimeClose = moment(i.timeClose, 'HH:mm').subtract(5, 'minutes').format('HH:mm');

                // Inisialisasi status notifikasi jika belum ada
                if (i.notifiedOpen === undefined) i.notifiedOpen = false;
                if (i.notifiedClose === undefined) i.notifiedClose = false;

                // Kirim notifikasi 5 menit sebelum buka grup
                if (i.timeOpen && time === warningTimeOpen && !i.notifiedOpen) {
                    i.notifiedOpen = true; // Tandai bahwa notifikasi telah dikirim
                    await conn.sendMessage(i.id, { text: `⚠️ Grup akan dibuka dalam 5 menit.` }, { quoted: null });
                }

                // Kirim notifikasi 5 menit sebelum tutup grup
                if (i.timeClose && time === warningTimeClose && !i.notifiedClose) {
                    i.notifiedClose = true; // Tandai bahwa notifikasi telah dikirim
                    await conn.sendMessage(i.id, { text: `⚠️ Grup akan ditutup dalam 5 menit.` }, { quoted: null });
                }

                // Saat waktu buka grup tiba
                if (i.timeOpen && time === i.timeOpen && !i.opened) {
                    i.opened = true;
                    i.notifiedOpen = false; // Reset agar bisa dipakai lagi besok

                    let getGroups = await conn.groupFetchAllParticipating();
                    let groups = Object.values(getGroups).map(g => g.id);

                    if (!groups.includes(i.id)) {
                        setTime.splice(setTime.indexOf(i), 1);
                        console.log('Menghapus auto open/close time pada group');
                        continue;
                    }

                    await conn.groupSettingUpdate(i.id, 'not_announcement');
                    await conn.sendMessage(i.id, { text: `✅ Grup telah dibuka.` }, { quoted: null });
                }

                // Saat waktu tutup grup tiba
                if (i.timeClose && time === i.timeClose && !i.closed) {
                    i.closed = true;
                    i.notifiedClose = false; // Reset agar bisa dipakai lagi besok

                    let getGroups = await conn.groupFetchAllParticipating();
                    let groups = Object.values(getGroups).map(g => g.id);

                    if (!groups.includes(i.id)) {
                        setTime.splice(setTime.indexOf(i), 1);
                        console.log('Menghapus auto open/close time pada group');
                        continue;
                    }

                    await conn.groupSettingUpdate(i.id, 'announcement');
                    await conn.sendMessage(i.id, { text: `❌ Grup telah ditutup.` }, { quoted: null });
                }

                // Reset status harian jika waktu saat ini bukan waktu buka/tutup
                if (i.timeOpen && time !== i.timeOpen && i.opened) i.opened = false;
                if (i.timeClose && time !== i.timeClose && i.closed) i.closed = false;
            }
        }, 60000); // Interval diperbesar menjadi 1 menit untuk mengurangi beban
    }
};

// Utility functions
const del = (groupId, _data) => {
    let position = _data.findIndex((entry) => entry.id === groupId);
    if (position !== -1) {
        _data.splice(position, 1); // Remove element from array
        return true;
    }
    return false;
};

const getIndex = (userId, _dir) => {
    let position = null;
    Object.keys(_dir).forEach((i) => {
        position = i;
    });
    if (position !== null) {
        return _dir[position];
    }
};

const getOpen = (userId, _dir) => {
    let position = null;
    Object.keys(_dir).forEach((i) => {
        if (_dir[i].id === userId) {
            position = i;
        }
    });
    if (position !== null) {
        return _dir[position].open;
    }
};

const getClose = (userId, _dir) => {
    let position = null;
    Object.keys(_dir).forEach((i) => {
        if (_dir[i].id === userId) {
            position = i;
        }
    });
    if (position !== null) {
        return _dir[position].close;
    }
};

const check = (userId, _dir) => {
    let status = false;
    Object.keys(_dir).forEach((i) => {
        if (_dir[i].id === userId) {
            status = true;
        }
    });
    return status;
};

export default {
    open,
    close,
    getOpen,
    getClose,
    running,
    check,
    getIndex,
    del,
};

import { fileURLToPath, URL } from "url";
const __filename = new URL("", import.meta.url).pathname;
const __dirname = new URL(".", import.meta.url).pathname;
import chalk from "chalk";
let file = fileURLToPath(import.meta.url);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(
        chalk.bgGreen(chalk.black("[  UPDATE ]")),
        chalk.white(`${__filename}`)
    );
    import(`${file}?update=${Date.now()}`);
});

