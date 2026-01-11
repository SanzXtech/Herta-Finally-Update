let handler = async (m, { conn, command, args, usedPrefix }) => {
    let type = (args[0] || '').toLowerCase();
    let users = global.db.data.users[m.sender];
    let time = users && users.lastkerja ? users.lastkerja + 3600000 : 0; // Cooldown set to 1 hour (3600000 ms)

    let jobs = {
        dokter: {
            emoji: '⚕️',
            names: ['Dokter Praktek Pribadi', 'Dokter Umum', 'Dokter Gigi', 'Dokter Spesialis'],
            actions: ['Menyembuhkan', 'Mendiagnosis', 'Menangani', 'Membantu']
        },
        kuli: {
            emoji: '👷‍♂️',
            names: ['Tukang Bangunan', 'Tukang Las', 'Tukang Kebun', 'Tukang Cat'],
            actions: ['Membangun', 'Memperbaiki', 'Merawat', 'Melukis']
        },
        montir: {
            emoji: '🔧',
            names: ['Montir Motor', 'Montir Mobil', 'Montir Sepeda', 'Montir Listrik'],
            actions: ['Memperbaiki', 'Mengganti', 'Mengoprek', 'Mengatasi']
        },
        ojek: {
            emoji: '🛵',
            names: ['Ojek Online', 'Ojek Pangkalan', 'Ojek Langganan', 'Ojek Part Time'],
            actions: ['Mengantar', 'Membawa', 'Menjemput', 'Mengirim']
        },
        pedagang: {
            emoji: '🛒',
            names: ['Pedagang Pasar', 'Pedagang Kaki Lima', 'Pedagang Keliling', 'Pedagang Online'],
            actions: ['Menjual', 'Melayani', 'Memasarkan', 'Membeli']
        },
        petani: {
            emoji: '🌾',
            names: ['Petani Padi', 'Petani Sayur', 'Petani Buah', 'Petani Ternak'],
            actions: ['Menanam', 'Merawat', 'Memanen', 'Membajak']
        },
        penulis: {
            emoji: '✍️',
            names: ['Penulis Buku', 'Penulis Artikel', 'Penulis Konten', 'Penulis Skripsi'],
            actions: ['Menulis', 'Mengedit', 'Menerjemahkan', 'Mencari Ide']
        },
        guru: {
            emoji: '👩‍🏫',
            names: ['Guru SD', 'Guru SMP', 'Guru SMA', 'Dosen'],
            actions: ['Mengajar', 'Memberikan Tugas', 'Mengoreksi', 'Membimbing']
        },
        desainer: {
            emoji: '🎨',
            names: ['Desainer Grafis', 'Desainer Mode', 'Desainer Interior', 'Desainer Produk'],
            actions: ['Mendesain', 'Mengedit', 'Membuat Konsep', 'Melakukan Riset']
        },
        programmer: {
            emoji: '💻',
            names: ['Frontend Developer', 'Backend Developer', 'Full-stack Developer', 'Game Developer'],
            actions: ['Mendesain UI', 'Menulis Kode', 'Mengembangkan Fitur', 'Menguji']
        },
        musisi: {
            emoji: '🎵',
            names: ['Pemain Gitar', 'Penyanyi', 'Produser Musik', 'Komposer'],
            actions: ['Membuat Lagu', 'Rekaman', 'Menulis Lirik', 'Belajar Musik Baru']
        },
        polisi: {
            emoji: '👮‍♂️',
            names: ['Polisi Lalu Lintas', 'Detektif', 'Polisi Patroli', 'Polisi Kriminal'],
            actions: ['Menangkap', 'Menyelidiki', 'Mengawasi', 'Melindungi']
        },
        damkar: {
            emoji: '🚒',
            names: ['Pemadam Kebakaran', 'Petugas Rescue', 'Driver Damkar', 'Petugas Hydrant'],
            actions: ['Memadamkan', 'Menyelamatkan', 'Mengendalikan', 'Mengevakuasi']
        },
        nelayan: {
            emoji: '🐟',
            names: ['Nelayan Laut', 'Nelayan Sungai', 'Nelayan Danau', 'Nelayan Kolam'],
            actions: ['Menangkap', 'Memancing', 'Mengumpulkan', 'Menjaring']
        },
        penambang: {
            emoji: '⛏️',
            names: ['Penambang Emas', 'Penambang Batu Bara', 'Penambang Bijih Besi', 'Penambang Batu'],
            actions: ['Menggali', 'Menambang', 'Mengangkut', 'Memproses']
        },
        sopir: {
            emoji: '🚗',
            names: ['Sopir Taksi', 'Sopir Truk', 'Sopir Pribadi', 'Sopir Bus'],
            actions: ['Mengantar', 'Mengemudi', 'Menjemput', 'Mengirim']
        },
        aktorbokep: {
            emoji: '🎥',
            names: ['Aktor Bokep', 'Bintang Film Dewasa', 'Pemain Porno', 'Artis XXX'],
            actions: ['Berakting', 'Syuting', 'Bermain', 'Berperan']
        },
        hacker: {
            emoji: '💻',
            names: ['Hacker White Hat', 'Hacker Black Hat', 'Hacker Grey Hat', 'Pentester'],
            actions: ['Meretas', 'Menganalisis', 'Menjebol', 'Melindungi']
        },
        tentara: {
            emoji: '🎖️',
            names: ['Tentara Infanteri', 'Tentara Kavaleri', 'Tentara Artileri', 'Tentara Penerbangan'],
            actions: ['Berpatroli', 'Menyerang', 'Melindungi', 'Bertempur']
        },
        kameramen: {
            emoji: '📹',
            names: ['Kameramen TV', 'Kameramen Film', 'Kameramen Dokumenter', 'Kameramen Perkawinan'],
            actions: ['Merekam', 'Mengambil Gambar', 'Mengedit Video', 'Mengatur Pencahayaan']
        },
        pelayan: {
            emoji: '🍽️',
            names: ['Pelayan Restoran', 'Pelayan Cafe', 'Pelayan Bar', 'Pelayan Hotel'],
            actions: ['Melayani', 'Mengambil Pesanan', 'Membersihkan Meja', 'Menyajikan Makanan']
        },
        koki: {
            emoji: '👨🏻‍🍳',
            names: ['Koki Sushi', 'Koki Italia', 'Koki Prancis', 'Koki Pastry'],
            actions: ['Memasak', 'Mempersiapkan Bahan', 'Mengatur Menu', 'Menghias Hidangan']
        }
    };

    let reasons = {
        dokter: ['Kesalahan diagnosa', 'Pelayanan kurang memuaskan', 'Kehabisan stok obat', 'Gagal operasi'],
        kuli: ['Kerjaan tidak selesai', 'Kerjaan asal jadi', 'Tidak masuk kerja', 'Kerjaan tidak rapih'],
        montir: ['Suku cadang habis', 'Gagal memperbaiki', 'Kendaraan hilang', 'Bengkel kebanjiran'],
        ojek: ['Kendaraan rusak', 'Tertinggal pesanan', 'Sakit mendadak', 'Tidak bisa dihubungi'],
        pedagang: ['Stok habis', 'Ditipu pelanggan', 'Kehilangan uang dagang', 'Kehabisan tempat dagang'],
        petani: ['Tanaman mati', 'Hama serang tanaman', 'Bencana alam', 'Pasar turun'],
        penulis: ['Writer\'s block', 'Deadline terlewati', 'Naskah hilang', 'Ide karya habis'],
        guru: ['Tugas guru berat', 'Pelajaran tidak dimengerti', 'Siswa nakal', 'Kehabisan materi ajar'],
        desainer: ['Klien tidak puas', 'Desain ditolak', 'Kurangnya inspirasi', 'Waktu pengerjaan terlalu lama'],
        programmer: ['Bug yang sulit ditemukan', 'Kode bocor', 'Kesalahan fatal', 'Pengujian tidak memuaskan'],
        musisi: ['Karya tidak diakui', 'Inspirasi musik hilang', 'Kesulitan dalam rekaman', 'Alat musik rusak'],
        polisi: ['Kejahatan terlalu sulit', 'Kurangnya bukti', 'Tersangka kabur', 'Kondisi berbahaya'],
        damkar: ['Kebakaran besar', 'Kekurangan air', 'Peralatan rusak', 'Kondisi berbahaya'],
        nelayan: ['Cuaca buruk', 'Jaring rusak', 'Tidak ada ikan', 'Perahu bocor'],
        penambang: ['Longsor', 'Peralatan rusak', 'Kehabisan bahan bakar', 'Kecelakaan kerja'],
        sopir: ['Kendaraan rusak', 'Jalan macet', 'Penumpang tidak ada', 'Kehabisan bahan bakar'],
        aktorbokep: ['Cedera saat syuting', 'Skenario tidak bagus', 'Penonton tidak puas', 'Masalah teknis'],
        hacker: ['Sistem terlalu aman', 'Kesalahan kode', 'Dilacak pihak berwajib', 'Kehabisan alat'],
        tentara: ['Musuh terlalu kuat', 'Cuaca buruk', 'Kesalahan strategi', 'Amunisi habis'],
        kameramen: ['Peralatan rusak', 'Cuaca buruk', 'Lokasi tidak cocok', 'Kesalahan teknis'],
        pelayan: ['Pesanan salah', 'Pelanggan marah', 'Kehabisan bahan', 'Masalah di dapur'],
        koki: ['Bahan habis', 'Kesalahan resep', 'Pelanggan tidak puas', 'Masalah di dapur']
    };

    let coinRewards = {
    dokter: { min: 20000, max: 80000 },
    kuli: { min: 15000, max: 60000 },
    montir: { min: 18000, max: 72000 },
    ojek: { min: 20000, max: 60000 },
    pedagang: { min: 22000, max: 55000 },
    petani: { min: 24000, max: 96000 },
    penulis: { min: 21000, max: 84000 },
    guru: { min: 24000, max: 96000 },
    desainer: { min: 25000, max: 100000 },
    programmer: { min: 27000, max: 110000 },
    musisi: { min: 18000, max: 90000 },
    polisi: { min: 25000, max: 100000 },
    damkar: { min: 25000, max: 100000 },
    nelayan: { min: 18000, max: 90000 },
    penambang: { min: 30000, max: 120000 },
    sopir: { min: 15000, max: 80000 },
    aktorbokep: { min: 35000, max: 140000 },
    hacker: { min: 30000, max: 120000 },
    tentara: { min: 25000, max: 100000 },
    kameramen: { min: 15000, max: 80000 },
    pelayan: { min: 12000, max: 70000 },
    koki: { min: 18000, max: 90000 }
};

    let job = jobs[type];
    if (!job) return conn.reply(m.chat, '*_Pilih salah satu pekerjaan yang tersedia!_*\n\n⚕️ Dokter\n👷‍♂️ Kuli\n🔧 Montir\n🛵 Ojek\n🛒 Pedagang\n🌾 Petani\n✍️ Penulis\n👩‍🏫 Guru\n🎨 Desainer\n💻 Programmer\n🎵 Musisi\n👮‍♂️ Polisi\n🚒 Damkar\n🐟 Nelayan\n⛏️ Penambang\n🚗 Sopir\n🎥 AktorBokep\n💻 Hacker\n🎖️ Tentara\n📹 Kameramen\n🍽️ Pelayan\n👨🏻‍🍳 Koki\n\n*_Contoh :   .kerja ojek_*', m);
    
    let randomName = pickRandom(job.names);
    let randomAction = pickRandom(job.actions);

    let reason = pickRandom(reasons[type]);
    let coinReward = Math.floor(Math.random() * (coinRewards[type].max - coinRewards[type].min + 1)) + coinRewards[type].min;

    let timeLeft = time - Date.now();
    if (timeLeft > 0) {
        setTimeout(() => {
            conn.reply(m.chat, `Waktunya untuk kembali bekerja!`, m);
        }, timeLeft);
        return conn.reply(m.chat, `Kamu sudah bekerja, saatnya istirahat selama ${clockString(timeLeft)}`, m);
    } else {
        global.db.data.users[m.sender].money += coinReward;
        global.db.data.users[m.sender].lastkerja = Date.now();
        m.reply(`Kamu Baru Selesai ${randomAction} *${job.emoji} ${randomName}*\nDan Mendapatkan Uang Senilai *Rp.${coinReward.toLocaleString()}*`);
    }
};

handler.help = ['kerja'];
handler.tags = ['rpg'];
handler.command = /^kerja$/i;
handler.register = true;
handler.group = true;
handler.rpg = true;

export default handler;

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
}

function clockString(ms) {
    let d = isNaN(ms) ? '--' : Math.floor(ms / 3600000) % 24;
    let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000) % 24;
    let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60;
    let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60;
    return [d, h, m, s].map(v => v.toString().padStart(2, 0)).join(':');
}
