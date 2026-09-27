import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const questions = [
  {
    title: "Bagaimana cara menentukan harga jual produk untuk pemula?",
    content: "Saya baru mulai bisnis kuliner rumahan (kue kering). Bahan bakunya fluktuatif harganya. Ada rumus jitu nggak ya buat nentuin harga jual biar nggak rugi tapi tetap bersaing di pasaran?",
    tags: ["Keuangan", "Kuliner", "Pemula"]
  },
  {
    title: "Tips beralih dari jualan offline ke online di Shopee/Tokopedia?",
    content: "Toko baju saya di pasar makin sepi karena orang pindah ke online. Saya mau coba jualan di marketplace, tapi bingung mulai dari mana. Apa saja yang perlu disiapkan? Foto produk yang bagus itu pakai kamera HP cukup nggak ya?",
    tags: ["Pemasaran", "E-commerce", "Fashion"]
  },
  {
    title: "Perlu nggak sih UMKM bikin PT atau CV dari awal?",
    content: "Skala bisnis saya masih kecil (omset 10jt/bulan), jualan kerajinan tangan. Apakah saya harus segera mengurus badan usaha seperti CV atau PT Perorangan? Apa keuntungannya untuk jangka panjang?",
    tags: ["Legalitas", "Administrasi"]
  },
  {
    title: "Gimana cara ngadepin komplain pelanggan yang galak?",
    content: "Baru aja dapet review bintang 1 di toko gara-gara kurir telat ngirim barang (padahal bukan salah saya). Pelanggannya ngomel-ngomel di chat. Gimana cara balasnya yang profesional biar rating toko nggak hancur?",
    tags: ["Pelayanan", "Tips Bisnis"]
  },
  {
    title: "Strategi jualan di TikTok Shop untuk produk skincare lokal",
    content: "Ada yang punya pengalaman sukses jualan di TikTok Shop? Lebih efektif mana antara rajin live streaming tiap hari atau bikin video pendek (VT) yang fyp lalu dikasih keranjang kuning?",
    tags: ["Pemasaran", "Sosial Media", "TikTok"]
  },
  {
    title: "Cara mengatur gaji karyawan untuk kedai kopi kecil",
    content: "Saya baru buka kedai kopi dan punya 2 barista (shift pagi & malam). Sistem gajinya mending bulanan tetap, atau ada sistem bagi hasil harian biar mereka semangat jualannya?",
    tags: ["SDM", "Manajemen", "F&B"]
  },
  {
    title: "Pengalaman daftar sertifikasi Halal dan BPOM, susah nggak?",
    content: "Produk sambal botolan saya mulai banyak yang pesan. Rencana mau masukin ke minimarket tapi syaratnya harus ada BPOM dan Halal. Berapa lama biasanya proses pengurusannya dan biayanya habis berapa?",
    tags: ["Legalitas", "F&B", "Perizinan"]
  },
  {
    title: "Mencari supplier bahan baku yang murah dan terpercaya",
    content: "Bisnis saya jualan tas kanvas sablon. Selama ini beli kain di pasar lokal agak mahal. Ada rekomendasi marketplace B2B atau cara nyari pabrik langsung yang nerima minimum order kecil (MOQ rendah)?",
    tags: ["Operasional", "Supplier"]
  },
  {
    title: "Apakah pasang ads (FB/IG Ads) efektif untuk bisnis jasa?",
    content: "Saya buka jasa cuci sepatu dan helm. Mau coba bakar uang 500rb buat iklan di Instagram Ads. Kira-kira efektif nggak ya buat nyari customer lokal di satu kota? Targeting-nya bagusnya disetting gimana?",
    tags: ["Pemasaran", "Digital Marketing", "Jasa"]
  },
  {
    title: "Cara pisahkan uang pribadi dan uang bisnis",
    content: "Penyakit lama saya: uang hasil jualan sering kepake buat belanja kebutuhan pribadi tanpa dicatat. Ujung-ujungnya pas mau restock barang, uangnya kurang. Gimana cara disiplin dan aplikasi pembukuan apa yang gampang buat orang awam?",
    tags: ["Keuangan", "Pembukuan", "Tips Bisnis"]
  }
];

const answers = [
  "Wah, pertanyaan bagus! Rumus gampangnya HPP (Harga Pokok Penjualan) dikali 2 atau 3. Tapi ingat hitung biaya tenaga kerja, listrik, dan kemasan ya. Biar kalau harga bahan baku naik dikit, marginnya masih aman.",
  "Kamera HP zaman sekarang sudah sangat mumpuni kok kak. Yang penting pencahayaan (lighting). Kalau bisa foto siang hari di dekat jendela. Dan jangan lupa riset keyword di pencarian marketplace biar produk kakak muncul di halaman depan.",
  "Untuk omset 10jt/bulan, saran saya buat NIB (Nomor Induk Berusaha) dulu saja, itu gratis kok lewat OSS. Nanti kalau omset sudah ratusan juta dan butuh pinjaman bank besar, baru upgrade ke CV atau PT Perorangan.",
  "Tetap tenang dan jangan baper kak. Balas dengan sopan: 'Mohon maaf atas keterlambatan pengiriman karena kendala di pihak ekspedisi. Kami akan bantu follow up agar barang segera sampai.' Jangan pernah menyalahkan kurir secara frontal di depan publik.",
  "Kalau untuk skincare, live streaming sangat ngaruh karena audiens bisa lihat tekstur dan review langsung. Tapi VT juga wajib. Kombinasinya: Bikin VT yang menarik, lalu arahkan penonton untuk join live kakak.",
  "Coba sistem gaji pokok + bonus target. Misalnya gaji pokoknya UMR daerah setempat, lalu ada bonus harian kalau omset kedai melebihi target tertentu. Dijamin barista bakal rajin upselling (nawarin menu tambahan).",
  "Sertifikasi Halal sekarang bisa lewat jalur Self Declare kalau produknya non-daging (seperti sambal nabati), itu gratis alias sehati. Kalau BPOM memang agak panjang, siapin waktu 3-6 bulan dan biaya sekitar 2-5 juta tergantung jenis uji lab.",
  "Bisa coba cari di Alibaba kalau mau impor, tapi kalau lokal coba ke platform seperti 1688 versi Indonesia, atau join grup Facebook 'Komunitas Sablon/Konveksi Tas'. Biasanya banyak maklon yang nongkrong di situ.",
  "Sangat efektif kak! Untuk jasa lokal, setting lokasi iklannya (radius) max 10-15 km dari toko kakak. Jangan target satu Indonesia, nanti boncos. Umurnya diset 18-35 tahun (biasanya mahasiswa/pekerja yang suka cuci sepatu).",
  "Pertama, bikin 2 rekening bank yang berbeda. Satu khusus bisnis, satu pribadi. Jangan pernah transfer uang dari rekening bisnis ke pribadi kecuali di akhir bulan sebagai 'gaji' kakak sendiri. Untuk aplikasi, coba BukuWarung atau Kasir Pintar."
];

const dummyUsers = [
  { username: 'budi_umkm', display_name: 'Budi Santoso', email: 'budi@example.com' },
  { username: 'siti_kuliner', display_name: 'Siti Rahmawati', email: 'siti@example.com' },
  { username: 'agus_fashion', display_name: 'Agus Pratama', email: 'agus@example.com' },
  { username: 'rini_jasa', display_name: 'Rini Yulianti', email: 'rini@example.com' },
  { username: 'hendra_tech', display_name: 'Hendra Wijaya', email: 'hendra@example.com' }
];

async function seed() {
  console.log('🌱 Starting redistribution to ACTIVE REAL users...');
  
  try {
    // 1. Ambil HANYA akun asli yang aktif (bukan akun dummy yang tadi saya buat)
    // Asumsinya akun dummy tadi pakai email '@example.com'
    const activeUsersRes = await pool.query("SELECT id, display_name FROM users WHERE email NOT LIKE '%@example.com'");
    
    if (activeUsersRes.rows.length === 0) {
      console.log('❌ Tidak ada akun asli yang ditemukan di database.');
      process.exit(1);
    }
    
    const userIds = activeUsersRes.rows.map(u => u.id);
    console.log(`✅ Menemukan ${userIds.length} akun aktif/asli untuk dijadikan penulis`);

    // 2. Re-assign all dummy questions to random real users
    console.log('📝 Mengacak ulang pertanyaan ke akun aktif...');
    const questionsRes = await pool.query("SELECT id FROM questions WHERE title LIKE '%Bagaimana cara menentukan harga%' OR title LIKE '%Tips beralih dari%' OR title LIKE '%Perlu nggak sih UMKM%' OR title LIKE '%Gimana cara ngadepin komplain%' OR title LIKE '%Strategi jualan di TikTok%' OR title LIKE '%Cara mengatur gaji%' OR title LIKE '%Pengalaman daftar sertifikasi%' OR title LIKE '%Mencari supplier bahan baku%' OR title LIKE '%Apakah pasang ads%' OR title LIKE '%Cara pisahkan uang%'");
    
    for (const q of questionsRes.rows) {
      const randomUserId = userIds[Math.floor(Math.random() * userIds.length)];
      await pool.query('UPDATE questions SET author_id = $1 WHERE id = $2', [randomUserId, q.id]);
    }

    // 3. Re-assign all answers to random real users
    console.log('💬 Mengacak ulang jawaban ke akun aktif...');
    // Kita ambil jawaban yang terhubung dengan pertanyaan dummy di atas
    const answersRes = await pool.query(`
      SELECT a.id FROM answers a 
      JOIN questions q ON a.question_id = q.id 
      WHERE q.title LIKE '%Bagaimana cara menentukan harga%' OR q.title LIKE '%Tips beralih dari%' OR q.title LIKE '%Perlu nggak sih UMKM%' OR q.title LIKE '%Gimana cara ngadepin komplain%' OR q.title LIKE '%Strategi jualan di TikTok%' OR q.title LIKE '%Cara mengatur gaji%' OR q.title LIKE '%Pengalaman daftar sertifikasi%' OR q.title LIKE '%Mencari supplier bahan baku%' OR q.title LIKE '%Apakah pasang ads%' OR q.title LIKE '%Cara pisahkan uang%'
    `);
    
    for (const a of answersRes.rows) {
      const randomUserId = userIds[Math.floor(Math.random() * userIds.length)];
      await pool.query('UPDATE answers SET author_id = $1 WHERE id = $2', [randomUserId, a.id]);
    }

    console.log('✅ Acak ulang ke akun aktif selesai! Silakan refresh website.');
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    await pool.end();
  }
}

seed();
