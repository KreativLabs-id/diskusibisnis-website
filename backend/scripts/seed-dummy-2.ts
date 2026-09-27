import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const businessImages = [
  "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80",
  "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=800&q=80",
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
  "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80",
  "https://images.unsplash.com/photo-1493723843671-1d655e66ac1c?w=800&q=80",
  "https://images.unsplash.com/photo-1559523182-a284c3fb7cff?w=800&q=80",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80",
  "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80",
  "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&q=80"
];

// 20 Questions
const newQuestions = [
  {
    title: "Mesin kasir POS yang cocok untuk minimarket dengan 5 cabang?",
    content: "Halo kawan-kawan, saya berencana upgrade sistem kasir karena pembukuan manual mulai keteteran. Ada rekomendasi sistem POS (Point of Sales) yang bisa integrasi stock real-time antar 5 cabang? Kalau bisa yang biaya bulanannya bersahabat untuk UMKM.",
    tags: ["Teknologi", "Operasional", "Retail"],
    images: [businessImages[0]]
  },
  {
    title: "Strategi diskon akhir tahun yang tidak merusak harga pasar?",
    content: "Setiap akhir tahun kompetitor selalu banting harga. Saya ingin ikut promo akhir tahun (Year End Sale) tapi takut brand image turun karena terkesan murahan. Gimana ya meracik promo yang elegan?",
    tags: ["Pemasaran", "Promo", "Strategi"],
    images: [businessImages[1]]
  },
  {
    title: "Mengurus perizinan PIRT untuk produk keripik singkong",
    content: "Saya baru mulai produksi keripik singkong skala rumahan. Mau tanya dong, step-step mengurus PIRT sekarang seperti apa? Apakah harus punya tempat produksi yang terpisah dari dapur rumah tangga?",
    tags: ["Legalitas", "PIRT", "Kuliner"],
    images: []
  },
  {
    title: "Berapa persen budget ideal untuk Facebook/Instagram Ads?",
    content: "Bisnis saya di bidang jasa fotografi pernikahan. Selama ini ngandelin organik aja, tapi pengen coba Ads. Sebenarnya alokasi budget marketing yang sehat itu berapa persen dari target omset ya?",
    tags: ["Digital Marketing", "Keuangan", "Jasa"],
    images: [businessImages[3]]
  },
  {
    title: "Cara packing aman untuk pengiriman frozen food ke luar kota?",
    content: "Produk frozen food saya sering lumer kalau dikirim pakai ekspedisi reguler lebih dari 2 hari. Ada tips penggunaan dry ice atau styrofoam yang efektif dan efisien dari segi biaya packing?",
    tags: ["Logistik", "F&B", "Operasional"],
    images: [businessImages[4]]
  },
  {
    title: "Menghadapi karyawan gen Z yang gampang resign (kutu loncat)",
    content: "Saya punya tim yang rata-rata umurnya 20-23 tahun. Kerjanya bagus dan kreatif, tapi entah kenapa retention rate-nya rendah, rata-rata cuma bertahan 6-8 bulan. Gimana ya cara manajemen SDM yang cocok buat Gen Z?",
    tags: ["SDM", "Manajemen", "Kepemimpinan"],
    images: []
  },
  {
    title: "Membangun sistem reseller yang menguntungkan kedua belah pihak",
    content: "Saya mau buka pendaftaran reseller untuk produk skincare saya. Baiknya sistem diskon berjenjang atau komisi langsung ya? Takutnya kalau diskon terlalu besar malah saya yang rugi operasional.",
    tags: ["Kemitraan", "Penjualan", "Reseller"],
    images: [businessImages[2]]
  },
  {
    title: "Pentingkah membuat website sendiri jika sudah jualan di Shopee?",
    content: "Omset di marketplace alhamdulillah stabil. Tapi saya dengar punya website sendiri itu penting buat jangka panjang (database pelanggan). Menurut teman-teman, worth it nggak sih biaya maintain website untuk UMKM?",
    tags: ["Teknologi", "E-commerce", "Branding"],
    images: [businessImages[5]]
  },
  {
    title: "Tips negosiasi harga sewa ruko agar dapat harga miring",
    content: "Rencana mau ekspansi buka toko offline. Nemu ruko yang strategis tapi harganya lumayan tinggi. Ada teknik negosiasi ke pemilik ruko biar bisa dapet diskon atau minimal termin bayarnya bisa per bulan/kuartal?",
    tags: ["Ekspansi", "Negosiasi", "Properti"],
    images: [businessImages[6]]
  },
  {
    title: "Mengatasi bahan baku mentah yang cepat busuk (Food Waste)",
    content: "Bisnis salad buah saya sering buang bahan (anggur, strawberry) karena cepat layu. Sudah ditaruh di chiller tapi tetep aja kalau sepi sisa banyak. Ada manajemen inventory atau trik simpan buah yang benar?",
    tags: ["Kuliner", "Operasional", "Inventory"],
    images: []
  },
  {
    title: "Cara daftar QRIS untuk merchant dan berapa lama prosesnya?",
    content: "Pelanggan sekarang rata-rata males bawa cash. Saya mau pasang QRIS di warung, mending daftar lewat bank langsung atau pakai PJP (Penyelenggara Jasa Pembayaran) seperti Nobu/Gopay? Bedanya apa?",
    tags: ["Keuangan", "Pembayaran", "Operasional"],
    images: [businessImages[7]]
  },
  {
    title: "Branding produk lokal agar terlihat premium dan mahal",
    content: "Saya produksi tas kulit sapi asli buatan Garut. Kualitasnya berani diadu dengan brand luar. Tapi susah banget jual dengan harga tinggi karena stigma 'lokal'. Gimana cara merombak visual branding-nya?",
    tags: ["Branding", "Fashion", "Pemasaran"],
    images: [businessImages[8]]
  },
  {
    title: "Manajemen waktu untuk pebisnis yang juga pekerja kantoran (Side Hustle)",
    content: "Saya masih kerja 9-to-5 tapi punya bisnis jualan online yang lumayan kencang. Sering kewalahan balas chat dan packing malam hari. Kapan saat yang tepat untuk berani resign dan full time di bisnis?",
    tags: ["Manajemen Waktu", "Inspirasi", "Pemula"],
    images: []
  },
  {
    title: "Pengalaman endorse Selebgram/TikToker Lokal, worth it kah?",
    content: "Bulan depan mau coba endorse food vlogger lokal untuk review cafe baru saya. Range harga mereka 500rb - 1jt per video. Apakah biasanya langsung berdampak ke traffic pengunjung cafe secara instan?",
    tags: ["Pemasaran", "Influencer", "F&B"],
    images: [businessImages[9]]
  },
  {
    title: "Mengurus Hak Merek (HAKI) agar nama bisnis tidak dicuri",
    content: "Nama kopi susu saya mulai terkenal di kota ini, tiba-tiba ada kedai lain di luar kota yang pakai nama persis sama. Saya mau daftarin HAKI ke DJKI, bisa diurus sendiri secara online nggak sih?",
    tags: ["Legalitas", "HAKI", "Perlindungan"],
    images: []
  },
  {
    title: "Menangani pelanggan B2B (Corporate) yang telat bayar invoice",
    content: "Saya nyuplai snack box rutin ke beberapa kantor. Masalahnya, kadang HRD/Keuangannya telat cairin invoice sampai 2 bulan. Cashflow saya jadi macet. Enaknya nagih gimana ya biar nggak merusak hubungan baik?",
    tags: ["B2B", "Keuangan", "Komunikasi"],
    images: [businessImages[0]]
  },
  {
    title: "Tips membuat SOP (Standard Operating Procedure) untuk kasir dan pelayan",
    content: "Restoran saya sudah punya 5 karyawan, tapi pelayanannya masih sering beda-beda tiap shift. Ada yang ramah, ada yang jutek. Gimana cara bikin SOP yang simpel tapi benar-benar dipatuhi sama mereka?",
    tags: ["SDM", "SOP", "Manajemen"],
    images: [businessImages[3]]
  },
  {
    title: "Memanfaatkan WhatsApp Business API untuk Auto-reply",
    content: "Chat di WA mulai ratusan per hari, admin manual sering keteteran balas sapaan awal. Kalau mau upgrade ke WA Business API yang pakai chatbot itu biayanya berapa ya per bulan? Ada rekomendasi vendor lokal?",
    tags: ["Teknologi", "Pelayanan", "WhatsApp"],
    images: []
  },
  {
    title: "Apakah wajar bisnis tahun pertama belum menghasilkan profit (rugi)?",
    content: "Sudah 8 bulan buka barbershop. Uang masuk selalu habis buat bayar operasional, gaji kapster, dan iklan. Belum ada sisa profit yang bisa saya ambil sebagai owner. Di bulan ke berapa biasanya bisnis mulai ROI/BEP?",
    tags: ["Keuangan", "Inspirasi", "Manajemen"],
    images: [businessImages[5]]
  },
  {
    title: "Cara menjual bisnis/franchise (Exit Strategy)",
    content: "Saya berencana pensiun dan ingin melepas/menjual kepemilikan bisnis laundry saya (ada 3 cabang berjalan baik). Gimana cara valuasi (menghitung harga jual) bisnis kita? Apakah hitung aset + omset 1 tahun?",
    tags: ["Investasi", "Ekspansi", "Franchise"],
    images: [businessImages[8]]
  }
];

// Provide at least 1-2 answers for each
const newAnswers = [
  // 1
  ["Kalau butuh integrasi real-time banyak cabang, Moka POS atau Pawoon sangat direkomendasikan kak. Biayanya sekitar 250-300rb/cabang per bulan. Kalau mau yang gratis/murah bisa coba Kasir Pintar Pro, tapi fitur antar cabangnya agak terbatas.", "Saya pakai Majoo kak. Sangat cocok buat retail karena inventory management-nya detail banget sampai ke HPP dan margin per produk di masing-masing cabang."],
  // 2
  ["Daripada banting harga (diskon %), mending main di 'Bundling' atau 'Buy 1 Get 1'. Jadi harga tetap, tapi volume barang yang keluar lebih banyak. Kesannya value for money, bukan barang murahan.", "Betul, bikin Exclusive Gift atau hampers akhir tahun. Tambahin packaging cantik. Diskonnya cukup free ongkir atau potongan minimal belanja yang besar."],
  // 3
  ["Untuk PIRT sekarang sudah jauh lebih mudah lewat OSS RBA kak. Tapi betul, syarat wajib dari Dinas Kesehatan adalah dapur produksi tidak boleh gabung dengan dapur harian rumah tangga. Minimal disekat atau beda ruangan.", "Bisa diurus di Dinkes setempat. Nanti bakal ada penyuluhan Keamanan Pangan dulu (PKP). Terkait dapur, asal kebersihannya terjamin dan terpisah dari aktivitas masak harian (bau bawang dll) masih bisa diusahakan lulus survei."],
  // 4
  ["Rule of thumb untuk UMKM biasanya 5-10% dari target omset. Jadi kalau target omset 50 juta, budget ads 2,5 - 5 juta. Kalau untuk jasa fotografi, portofolio di IG lebih penting, ads dipakai buat boost postingan terbaik aja.", "Fokus di IG Ads aja kak untuk visual. Mulai dari budget kecil dulu 50rb/hari selama seminggu. Kalau ROI (Return on Investment) dapet klien nutup biaya iklan, baru di-scale up budgetnya."],
  // 5
  ["Wajib pakai styrofoam box tebal (minimal 2cm). Di dalamnya kasih ice gel pack yang sudah dibekukan minimal 24 jam. Jangan lupa produk di-vacuum sealer hampa udara. Tahan sampai 3-4 hari di perjalanan darat.", "Jangan pakai dry ice kalau lewat ekspedisi umum/pesawat karena termasuk barang berbahaya (DG). Ice gel lebih aman dan bisa di-reuse oleh customer."],
  // 6
  ["Gen Z butuh 'Purpose' (tujuan) dan 'Feedback' (apresiasi) yang cepat. Jangan cuma disuruh kerja rutin. Ajak mereka meeting, dengarkan ide mereka, dan kasih title atau tanggung jawab spesifik. Mereka nggak suka micro-management.", "Pastikan lingkungan kerja (culture) asik. Bikin jadwal fleksibel kalau memungkinkan. Gen Z sangat peduli dengan work-life balance dan mental health kak."],
  // 7
  ["Kalau margin kakak tebal (di atas 50%), sistem diskon berjenjang (Makin banyak beli makin murah) itu paling gampang dihitung. Tapi kalau margin mepet, komisi dropship (afiliasi) lebih aman karena kakak nggak numpuk dead-stock di reseller.", "Bikin sistem reward aja. Harga jual seragam, komisi flat, tapi kalau capai target bulanan dapet emas antam atau bonus cash. Reseller lebih semangat kejar reward fisik."],
  // 8
  ["Sangat penting! Shopee itu ibarat kita ngontrak di mall, aturannya bisa berubah (admin fee naik, dll). Kalau website, itu rumah kita sendiri. Trafik organik dari Google juga bisa jadi passive income pengunjung jangka panjang.", "Untuk UMKM, kalau belum kuat bayar tim IT mending pakai Shopify atau Berdu. Cukup bayar bulanan nggak ribet urus server. Worth it banget buat bikin brand terlihat kredibel."],
  // 9
  ["Tekniknya: bayar di muka untuk jangka panjang. 'Pak, saya langsung ambil 2 tahun tapi minta diskon 15% ya'. Pemilik ruko suka kepastian. Kalau minta bayar bulanan agak susah, mungkin bisa ditawar bayar per 6 bulan.", "Coba cari ruko yang sebelahnya kosong juga, jadikan perbandingan harga. Lalu tawarkan win-win: 'Saya akan renovasi interiornya jadi bagus, nilai aset bapak akan naik, boleh minta grace period 1 bulan gratis sewa selama renovasi?'"],
  // 10
  ["Metode FIFO (First In First Out) wajib. Buah yang datang duluan taruh paling depan. Dan kalau sudah mulai jelek teksturnya (tapi masih layak makan), segera jadikan selai buah atau jus sebagai menu tambahan.", "Gunakan vacuum container untuk buah potong. Umur simpannya bisa nambah 2-3 hari dibanding wadah biasa."],
  // 11
  ["Kalau daftar lewat bank BUMN/Swasta biasanya makan waktu 1-2 minggu. Kalau lewat PJP (DANA, Gopay, Youtap) biasanya 1-3 hari kerja sudah jadi. MDR (potongan) QRIS sekarang seragam kok kak dari BI (0.3% untuk mikro).", "Mending pakai aplikasi POS yang sudah sepaket sama QRIS dinamis kak (langsung muncul nominalnya). Jadi kasir nggak repot cek mutasi manual."],
  // 12
  ["Packaging is king! Tasnya bungkus pakai dustbag, taruh di hardbox, kasih kartu garansi kulit dan thank you card dengan nama customer ditulis tangan. Difoto pakai konsep minimalis elegan. Dijamin harga 1 juta ke atas pada berebut.", "Kolaborasi dengan influencer yang image-nya luxury/old money. Jangan pakai sembarang artis TikTok yang audiensnya anak sekolah. Targeting pasar menenentukan harga."],
  // 13
  ["Resign itu pakai hitungan matematika kak, bukan nekat. Kalau net profit bisnis kakak per bulan sudah stabil 2x lipat dari gaji kantor selama 3-6 bulan berturut-turut, itu lampu hijau buat resign.", "Jangan resign dulu kalau operasional bisnis belum punya sistem. Lebih baik uang profit bisnis dipakai buat hire admin part-time untuk balas chat dan packing."],
  // 14
  ["Worth it banget kalau target audiens si influencer sesuai sama lokasi cafe kakak (misal: vlogger spesialis kuliner Jogja). Jangan endorse selebgram beauty kalau jualannya makanan berat.", "Biasanya impactnya terasa seminggu pertama (FOMO). Pastikan stok bahan baku dan mental karyawan siap menghadapi lonjakan pesanan biar customer nggak kecewa pelayanan lama."],
  // 15
  ["Bisa banget urus sendiri via website dgip.go.id. Biayanya sekitar 1.8jt untuk UMKM. Tapi wajib riset dulu di PDKI apakah namanya beneran belum ada yang daftar di kelas yang sama.", "Kalau nggak mau ribet dan takut ditolak (hangus uangnya), mending sewa konsultan HKI. Tambah biaya dikit tapi mereka yang riset mendalam soal potensi penolakan."],
  // 16
  ["Bikin MoU di awal soal jatuh tempo (Term of Payment) dan cantumkan denda keterlambatan (late fee) 1% per minggu. Biasanya kalau ada klausul denda, HRD akan memprioritaskan invoice kakak di bagian finance.", "Rajin follow-up dengan ramah 3 hari sebelum jatuh tempo. 'Halo ibu, reminder invoice XYZ akan jatuh tempo tanggal sekian ya'. Jangan nagih pas udah lewat jauh."],
  // 17
  ["Bikin SOP jangan pakai teks panjang berhalaman-halaman. Karyawan malas baca. Bikin bentuk flowchart atau checklist dengan gambar di tempel di area kerja (dapur/kasir).", "Lakukan roleplay tiap pagi (briefing 10 menit). Suruh satu pelayan jadi customer galak, satu lagi latihan SOP senyum dan sapa. Teori doang tanpa dipraktekkan nggak akan jalan."],
  // 18
  ["Biaya WA API resmi (BSP) biasanya ada abonemen bulanan (sekitar 300-500rb) ditambah biaya per sesi percakapan dari Meta. Coba cek vendor lokal seperti Qiscus, Watzap, atau Barantum.", "Kalau skala UMKM dan ngerasa WA API kemahalan, pakai WA Business biasa dulu + fitur quick replies. Atau pakai aplikasi keyboard semacam Selly buat nyimpen template balasan."],
  // 19
  ["Wajar banget! Tahun pertama itu masa bakar uang buat cari pelanggan loyal dan edukasi pasar. BEP rata-rata bisnis fisik (F&B/Jasa) itu 12-18 bulan. Tetap semangat, pastikan burn rate (arus kas keluar) masih aman.", "Kalau udah 8 bulan, coba evaluasi Kak. Apakah ruginya karena capex (beli alat/renovasi) atau karena opex (biaya harian > pendapatan harian). Kalau tiap hari nombok biaya operasional, harus segera ubah strategi marketing atau potong cost."],
  // 20
  ["Metode sederhana untuk UMKM: (Laba bersih rata-rata per bulan x 12 atau 24 bulan) + Nilai wajar seluruh aset fisik (mesin, interior, dll) - Utang. Misal laba 5jt/bln, minta valuasi 120jt + aset 50jt = 170jt.", "Tergantung sistemnya kak. Kalau kakak jual sistem franchise yang bisa jalan otomatis tanpa kakak turun tangan, multiplier (pengalinya) bisa 3-5 tahun dari profit. Tapi kalau masih one-man show, nilainya jadi turun."]
];

async function seedData() {
  console.log('🌱 Starting advanced dummy data seeding...');
  
  try {
    // 1. Get ALL active real users
    const activeUsersRes = await pool.query("SELECT id, display_name FROM users WHERE email NOT LIKE '%@example.com'");
    
    let users = activeUsersRes.rows;
    if (users.length < 2) {
      console.log('⚠️ Kurang dari 2 akun asli ditemukan. Menggunakan semua akun yang ada di database.');
      const allUsers = await pool.query("SELECT id, display_name FROM users");
      users = allUsers.rows;
    }
    
    if (users.length < 2) {
      console.log('❌ Minimal butuh 2 user di database untuk membuat simulasi tanya jawab.');
      process.exit(1);
    }

    console.log(`✅ Menemukan ${users.length} akun untuk dijadikan penulis`);

    let totalReputationAdded = 0;

    for (let i = 0; i < newQuestions.length; i++) {
      const q = newQuestions[i];
      const answersForThisQ = newAnswers[i];
      
      // Select random author for question
      const questionAuthor = users[Math.floor(Math.random() * users.length)];
      
      // INSERT QUESTION
      const imagesJson = q.images.length > 0 ? JSON.stringify(q.images) : null;
      
      const qRes = await pool.query(
        `INSERT INTO questions (title, content, author_id, views_count, images) 
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [
          q.title, 
          q.content, 
          questionAuthor.id, 
          Math.floor(Math.random() * 800) + 50, // 50 to 850 views
          imagesJson
        ]
      );
      
      const questionId = qRes.rows[0].id;
      console.log(`📝 Q: "${q.title.substring(0, 40)}..." by ${questionAuthor.display_name}`);

      // INSERT TAGS
      for (const tagName of q.tags) {
        let tagId;
        const tagSlug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        try {
          const tagRes = await pool.query(
            'INSERT INTO tags (name, slug) VALUES ($1, $2) ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id',
            [tagName, tagSlug]
          );
          tagId = tagRes.rows[0].id;
        } catch (e) {
          const tRes = await pool.query('SELECT id FROM tags WHERE slug = $1', [tagSlug]);
          tagId = tRes.rows[0].id;
        }
        await pool.query(
          'INSERT INTO question_tags (question_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [questionId, tagId]
        );
      }

      // INSERT ANSWERS
      for (const [index, answerContent] of answersForThisQ.entries()) {
        // Find a random user that is DIFFERENT from the questionAuthor
        let answerAuthor;
        do {
          answerAuthor = users[Math.floor(Math.random() * users.length)];
        } while (answerAuthor.id === questionAuthor.id); // Ensure question author != answer author

        const isAccepted = index === 0; // First answer is accepted

        await pool.query(
          `INSERT INTO answers (question_id, author_id, content, is_accepted) 
           VALUES ($1, $2, $3, $4)`,
          [questionId, answerAuthor.id, answerContent, isAccepted]
        );
        console.log(`  💬 Answer by ${answerAuthor.display_name} (Accepted: ${isAccepted})`);

        // ADD REPUTATION TO ANSWER AUTHOR
        const reputationEarned = isAccepted ? 15 : 5;
        await pool.query(
          'UPDATE users SET reputation_points = COALESCE(reputation_points, 0) + $1 WHERE id = $2',
          [reputationEarned, answerAuthor.id]
        );
        totalReputationAdded += reputationEarned;
      }
      
      // Update answers_count on question
      await pool.query(
        'UPDATE questions SET answers_count = $1 WHERE id = $2',
        [answersForThisQ.length, questionId]
      );
    }

    console.log('✅ Seeding 20 Questions + Images + Answers completed!');
    console.log(`📈 Total ${totalReputationAdded} reputation points distributed to users.`);
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    await pool.end();
  }
}

seedData();
