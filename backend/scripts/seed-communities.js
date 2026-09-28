require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

const communitiesData = [
  {
    name: "Pejuang F&B Jabodetabek",
    category: "fnb",
    location: "Jabodetabek",
    description: "Tempat nongkrong virtual buat para owner cafe, resto, warkop, sampai gerobakan di Jabodetabek. Kita bahas supplier murah, drama gofood/grabfood, sampai cara ngakalin sewa ruko yang makin gila harganya.",
    vision: "Bikin ekosistem F&B Jabodetabek yang saling support, bukan saling sikut.",
    mission: "- Sharing info supplier tangan pertama\n- Kolaborasi menu atau event\n- Curhat bareng soal operasional sehari-hari",
    target_members: "Pemilik usaha kuliner, manajer resto, chef, atau yang baru mau buka usaha F&B.",
    benefits: "- Dapet kenalan supplier murah\n- Promo silang antar member\n- Insight tren makanan terbaru",
    avatar: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&q=80",
    questions: [
      { title: "Ada yang tau supplier ayam potong murah area Jaksel?", content: "Lagi pusing nih harga ayam lagi naik terus. Ada rekomendasi supplier ayam potong tangan pertama yang bisa kirim ke daerah Cipete tiap pagi?" }
    ]
  },
  {
    name: "Juragan Online Shop Bandung",
    category: "retail",
    location: "Bandung",
    description: "Kumpulan para suhu dan newbie olshop area Bandung Raya. Ngomongin soal trik FYP Tiktok, ngakalin algoritma Shopee, sampai drama retur COD.",
    vision: "Bandung jadi pusat kiblat fashion dan retail online se-Indonesia.",
    mission: "- Bedah toko bareng\n- Sharing trik ngiklan yang boncosnya minim\n- Kopi darat bulanan di kafe hits",
    target_members: "Seller Shopee/Tokped/Tiktok, owner brand lokal, dropshipper.",
    benefits: "- Akses ke list konveksi murah\n- Belajar ads bareng\n- Teman seperjuangan buat ngeluh soal kurir",
    avatar: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=200&q=80",
    questions: [
      { title: "Gimana sih caranya biar pecah telor di TikTok Shop?", content: "Udah live tiap hari 2 jam tapi yang nonton mentok di 5 orang. Ada trik pancingan awal nggak ya suhu-suhu?" }
    ]
  },
  {
    name: "Nongkrong Bareng Freelancer",
    category: "jasa",
    location: "Nasional",
    description: "Wadah keluh kesah dan sharing ilmu para pekerja lepas (freelancer) Indonesia. Dari mulai design, copywriter, programmer, sampai VA ngumpul disini.",
    vision: "Freelancer Indonesia dibayar layak dan nggak gampang diakalin klien red flag.",
    mission: "- Bikin standar harga jasa (rate card)\n- Blacklist klien bermasalah\n- Sharing cara dapet klien luar negeri via Upwork/Fiverr",
    target_members: "Freelancer full-time maupun part-time, anak agency yang mau resign.",
    benefits: "- Lemparan project dari sesama member\n- Template kontrak kerja biar aman\n- Review portfolio bareng",
    avatar: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&q=80",
    questions: [
      { title: "Cara nagih invoice ke klien yang udah sebulan ngilang?", content: "Project udah kelar, revisi udah dikerjain, tapi pas ditagih invoice-nya di-read doang. Kalau di-spam takutnya merusak hubungan. Enaknya gimana ya?" }
    ]
  },
  {
    name: "Emak-Emak Jago Jualan",
    category: "komunitas",
    location: "Nasional",
    description: "Komunitas khusus emak-emak dan perempuan yang punya usaha sampingan atau full jualan dari rumah. Mulai dari jualan daster, frozen food, sampai dandanin kue ultah.",
    vision: "Perempuan mandiri secara finansial meski dari dalam rumah.",
    mission: "- Saling support jualan member (larisin temen)\n- Sharing cara bagi waktu urus anak dan packing barang\n- Edukasi melek keuangan keluarga",
    target_members: "Ibu rumah tangga, mahasiswi, atau perempuan pekerja yang punya side-hustle.",
    benefits: "- Support system yang hangat dan no-baper\n- Pelatihan jualan via WA story\n- Bisa ikut bazar bareng",
    avatar: "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=200&q=80",
    questions: [
      { title: "Enaknya jualan apa ya bund yang modalnya di bawah 500rb?", content: "Lagi pengen iseng cari tambahan uang jajan, anak udah mulai sekolah jadi agak luang paginya. Kira-kira jualan apa yang perputarannya cepat?" }
    ]
  },
  {
    name: "Exportir Muda Nusantara",
    category: "export",
    location: "Nasional",
    description: "Forum diskusi para calon dan praktisi eksportir. Kita bahas cara cari buyer luar negeri, masalah perizinan (NIB, undername), sampai ngitung FCL/LCL biar nggak tekor di ongkir.",
    vision: "Produk UMKM Indonesia merajai pasar global.",
    mission: "- Edukasi regulasi ekspor tiap negara\n- Sharing data buyer valid\n- Kolaborasi pengiriman kontainer bareng (LCL)",
    target_members: "Produsen lokal, trader, petani, pengrajin yang mau scale up ke pasar internasional.",
    benefits: "- Info pameran luar negeri dari Kemendag\n- Koneksi ke forwarder terpercaya\n- Konsultasi perizinan gratis dari suhu",
    avatar: "https://images.unsplash.com/photo-1586528116311-ad8ed716d408?w=200&q=80",
    questions: [
      { title: "Ada yang pernah kirim sampel produk makanan ke Dubai pakai EMS?", content: "Buyer di Dubai minta dikirimi sampel keripik tempe. Kalau pakai EMS aman nggak ya dari sisi cukainya sana?" }
    ]
  },
  {
    name: "Petani & Peternak Millenial",
    category: "agribisnis",
    location: "Jawa-Bali",
    description: "Komunitas modern buat kamu yang main di sektor hulu: hidroponik, peternakan lele, ayam petelur, sampai budidaya maggot. Petani sekarang udah pakai IoT lho!",
    vision: "Regenerasi petani Indonesia yang melek teknologi dan bisnis.",
    mission: "- Modernisasi sistem bertani/beternak\n- Memotong jalur tengkulak dengan direct selling\n- Edukasi pupuk organik dan pakan alternatif",
    target_members: "Anak muda yang terjun ke pertanian/peternakan, supplier alsin, mahasiswa pertanian.",
    benefits: "- Akses langsung ke end-user atau restoran (tanpa tengkulak)\n- Sharing SOP budidaya yang anti-gagal\n- Update harga komoditas harian",
    avatar: "https://images.unsplash.com/photo-1592982537447-6f2a6a0a30b5?w=200&q=80",
    questions: [
      { title: "Cara ngakalin harga pakan ayam yang lagi gila-gilaan", content: "Harga pur naik terus, ada ide buat substitusi pakan yang proteinnya tetap dapet tapi harganya miring? Ada yang udah nyoba pakai maggot full?" }
    ]
  },
  {
    name: "Komunitas Jasa Kreatif Jatim",
    category: "jasa",
    location: "Jawa Timur",
    description: "Arek-arek kreatif Jatim kumpul kene! Mulai dari videografer, fotografer wedding, EO, sampai talent/KOL. Kita bahas cara nembus vendor korporat sampe nego harga.",
    vision: "Mengangkat standar kualitas dan harga jasa industri kreatif di Timur Jawa.",
    mission: "- Standarisasi harga jasa (biar nggak pada banting harga)\n- Bikin event kolaborasi tahunan\n- Sharing legalitas kontrak kerja",
    target_members: "Pelaku industri kreatif, agensi lokal, vendor pernikahan, seniman.",
    benefits: "- Sering dapet over-an job kalau tanggalnya bentrok\n- Rekomendasi vendor sewa alat yang murah dan amanah\n- Networking bareng EO besar",
    avatar: "https://images.unsplash.com/photo-1542744094-24638ea0b3b5?w=200&q=80",
    questions: [
      { title: "Rekomendasi vendor sewa lensa di Surabaya yang syaratnya nggak ribet?", content: "Lensa andalan rusak pas mau ada shoot lusa. Butuh banget sewa 70-200mm, ada rekomendasi tempat yang bisa sewa dadakan?" }
    ]
  },
  {
    name: "Startup Founders Jakarta",
    category: "teknologi",
    location: "Jakarta",
    description: "Tongkrongan para founder, co-founder, dan C-levels startup early stage. Tempat diskusi soal pitch deck, cari angle funding, sampe curhat soal burn-rate yang makin ngeri.",
    vision: "Menciptakan unicorn berikutnya dari lorong-lorong Jakarta.",
    mission: "- Pitching clinic bulanan\n- Networking dengan VC dan angel investor\n- Sharing strategi bakar uang yang sehat (growth hack)",
    target_members: "Tech founders, product managers, angel investors, startup enthusiasts.",
    benefits: "- Akses tertutup ke investor network\n- Diskon AWS/GCP credits khusus komunitas\n- Mentorship dari founder yang udah exit",
    avatar: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=200&q=80",
    questions: [
      { title: "Valuasi pre-seed untuk aplikasi SaaS B2B lokal bagusnya di angka berapa?", content: "Baru mau fundraising round pertama, traction udah ada walau dikit (MRR sekitar 15jt). Mending nawarin valuasi berapa ya ke Angel Investor biar masuk akal?" }
    ]
  },
  {
    name: "Agen & Reseller Kosmetik",
    category: "retail",
    location: "Nasional",
    description: "Grup asik buat para suhu skincare dan kosmetik lokal. Ngomongin produk yang lagi hype, cara dapet harga distributor, sampai tips nge-live yang bikin check-out membludak.",
    vision: "Bikin semua member makin glowing dan rekening makin gendut.",
    mission: "- Info flash sale dari pusat\n- Bedah ingredient skincare\n- Sharing cara rekrut dropshipper di bawah kita",
    target_members: "Reseller resmi, distributor skincare, dropshipper, beauty enthusiast.",
    benefits: "- Sering dapet bocoran produk baru sebelum rilis\n- Tuker-tukeran stok kalau ada produk yang susah laku\n- Diajarin cara baca tren kosmetik",
    avatar: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&q=80",
    questions: [
      { title: "Review jualan produk Somethinc vs Skintific, lebih kenceng mana perputarannya?", content: "Rencana mau nambah modal buat stok barang, menurut suhu disini lebih aman nyetok brand yang mana ya buat jangka panjang?" }
    ]
  },
  {
    name: "Pengusaha Properti Pemula",
    category: "properti",
    location: "Nasional",
    description: "Buat yang baru mau main di kos-kosan, kontrakan, atau jadi developer perumahan cluster kecil. Bahas soal balik modal (ROI), legalitas IMB/PBG, sampai trik KPR.",
    vision: "Mencetak juragan tanah dan kos-kosan baru tiap tahun.",
    mission: "- Edukasi investasi lelang bank\n- Hitung-hitungan RAB bangun kos biar nggak ketipu mandor\n- Sharing trik negosiasi harga tanah",
    target_members: "Calon juragan kos, agen properti, developer pemula, kontraktor.",
    benefits: "- Info tanah BU (Butuh Uang) yang harganya di bawah pasaran\n- Review bareng layout kosan yang paling disukai anak zaman now\n- Network notaris dan orang BPN",
    avatar: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200&q=80",
    questions: [
      { title: "Beli rumah lelang bank, ruginya dimana aja sih?", content: "Sering lihat iklan rumah lelang bank harganya jauh di bawah pasar. Ada yang punya pengalaman pahit nggak ngurus beginian? Takutnya disuruh ngusir penghuni lama sendiri." }
    ]
  }
];

async function seedCommunities() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Get all real users
    const usersRes = await client.query('SELECT id FROM public.users WHERE email NOT LIKE \'%@example.com\' AND email != \'admin@diskusibisnis.com\'');
    const users = usersRes.rows;
    
    if (users.length < 5) throw new Error("Not enough real users.");
    
    for (const comm of communitiesData) {
      const slug = comm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const creator = users[Math.floor(Math.random() * users.length)];
      
      // Delete existing if any just to be safe
      await client.query('DELETE FROM public.communities WHERE slug = $1', [slug]);
      
      // Select 3 to 6 random members
      const numMembers = Math.floor(Math.random() * 4) + 3;
      const members = [...users].sort(() => 0.5 - Math.random()).slice(0, numMembers);
      
      // Make sure creator is in members
      if (!members.find(m => m.id === creator.id)) {
        members.push(creator);
      }
      
      const insertRes = await client.query(`
        INSERT INTO public.communities 
        (name, slug, description, category, location, avatar_url, vision, mission, target_members, benefits, created_by, members_count, questions_count, is_popular)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, true)
        RETURNING id
      `, [
        comm.name, slug, comm.description, comm.category, comm.location, comm.avatar,
        comm.vision, comm.mission, comm.target_members, comm.benefits, creator.id,
        members.length, comm.questions.length
      ]);
      
      const commId = insertRes.rows[0].id;
      
      // Insert members
      for (const member of members) {
        const role = member.id === creator.id ? 'admin' : 'member';
        await client.query(
          'INSERT INTO public.community_members (community_id, user_id, role) VALUES ($1, $2, $3)',
          [commId, member.id, role]
        );
      }
      
      // Insert questions
      for (const q of comm.questions) {
        const qAuthor = members[Math.floor(Math.random() * members.length)];
        const qInsert = await client.query(`
          INSERT INTO public.questions (title, content, author_id, community_id, views_count)
          VALUES ($1, $2, $3, $4, $5) RETURNING id
        `, [q.title, q.content, qAuthor.id, commId, Math.floor(Math.random()*200) + 10]);
        
        // Add one random answer
        const answerAuthor = members.find(m => m.id !== qAuthor.id) || creator;
        if (answerAuthor.id !== qAuthor.id) {
          await client.query(`
            INSERT INTO public.answers (question_id, author_id, content) VALUES ($1, $2, $3)
          `, [qInsert.rows[0].id, answerAuthor.id, "Wah menarik nih pertanyaannya. Nyimak dulu ya nunggu suhu yang lain turun tangan."]);
          
          await client.query('UPDATE public.questions SET answers_count = 1 WHERE id = $1', [qInsert.rows[0].id]);
        }
      }
      
      console.log('✅ Created community:', comm.name, 'with', members.length, 'members');
    }
    
    await client.query('COMMIT');
    console.log('All 10 communities created perfectly!');
  } catch(e) {
    await client.query('ROLLBACK');
    console.error('Error:', e);
  } finally {
    client.release();
    pool.end();
  }
}

seedCommunities();
