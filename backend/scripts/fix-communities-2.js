require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

const MORE_QUESTIONS = [
  // F&B Jabodetabek (fnb)
  { comm: 'pejuang-f-b-jabodetabek', title: 'Trik ngadepin ojol yang sering marah-marah gara-gara nunggu lama', content: 'Gimana ya ngatasin driver yang gak sabaran pas jam sibuk makan siang? Dapur udah full speed tapi tetep aja pada ngedumel.' },
  { comm: 'pejuang-f-b-jabodetabek', title: 'Sewa mesin kopi vs Beli cash bekas, mending mana?', content: 'Buat kedai kopi skala kecil yang sehari kejual 50 cup, mending sewa alat (include maintenance) atau nekat beli bekas tapi resiko benerin sendiri?' },
  // Online Shop Bandung (retail)
  { comm: 'juragan-online-shop-bandung', title: 'Bahan kaos combed 30s di suci makin tipis?', content: 'Ada yang ngerasa nggak sih supplier kain di Suci belakangan ini gramasinya turun? Minta info supplier kain yang konsisten dong.' },
  { comm: 'juragan-online-shop-bandung', title: 'Perang harga di Shopee bikin margin sisa 2000 perak, tahan nggak ya?', content: 'Asli capek banget perang harga. Kompetitor pada jual rugi. Solusinya gimana selain bakar duit?' },
  // Freelancer (jasa)
  { comm: 'nongkrong-bareng-freelancer', title: 'Situs selain Upwork buat nyari klien desain grafis', content: 'Upwork sekarang connect-nya mahal banget dan persaingan ketat sama India/Pakistan. Ada alternatif platform lain yang fee-nya masuk akal?' },
  { comm: 'nongkrong-bareng-freelancer', title: 'Cara nolak halus revisi ke-10 dari klien tanpa putus hubungan', content: 'Klien ini bayar lancar, tapi revisinya astaga.. nggak kelar-kelar. Mau nolak takut dia lari ke kompetitor. Kasih saran kalimat nolaknya dong.' },
  // Emak-Emak Jago Jualan (komunitas)
  { comm: 'emak-emak-jago-jualan', title: 'Bunda, open PO masakan matang buat sahur bulan puasa nanti prospek nggak ya?', content: 'Rencana mau tes pasar bikin paket sahur. Menurut bunda-bunda mending harian atau langsung paket langganan mingguan?' },
  { comm: 'emak-emak-jago-jualan', title: 'Cara ngatur uang hasil jualan biar nggak kecampur sama uang belanja', content: 'Sering banget uang modal jualan kepakai buat beli beras dan susu anak. Ada trik biar disiplin pisahin uangnya?' },
  // Exportir (export)
  { comm: 'exportir-muda-nusantara', title: 'Standar packaging untuk briket arang kelapa ke Timur Tengah', content: 'Ada buyer minta briket, tapi saya bingung inner box-nya harus dicetak bahasa Arab atau cukup bahasa Inggris saja?' },
  { comm: 'exportir-muda-nusantara', title: 'Ngurus COO (Certificate of Origin) itu bisa online atau harus datang ke dinas?', content: 'Saya domisili di kabupaten, lumayan jauh ke kota. Apakah form SKA sekarang udah full online?' },
  // Peternak (agribisnis)
  { comm: 'petani-peternak-millenial', title: 'Hidroponik selada saat musim hujan rawan busuk akar, pencegahannya?', content: 'Bulan ini curah hujan tinggi banget. Atap green house udah aman, tapi air tandon suhunya drop drastis. Ada yang pakai heater tandon?' },
  { comm: 'petani-peternak-millenial', title: 'Budidaya lele sistem bioflok untuk lahan sempit (2x3 meter)', content: 'Punya sisa lahan di belakang rumah, kalau dibikin 1 kolam bundar aja ROI-nya masuk akal nggak ya buat nambah penghasilan?' },
  // Kreatif Jatim (jasa)
  { comm: 'komunitas-jasa-kreatif-jatim', title: 'Standar rate card fotografer wedding di Surabaya tahun 2026', content: 'Banyak klien nawar sadis pakai alasan "baru merintis". Berapa sih rate wajar buat 1 hari full liputan sekarang?' },
  { comm: 'komunitas-jasa-kreatif-jatim', title: 'Vendor cetak album kolase paling cepet dan murah di Malang?', content: 'Klien minta album jadi dalam 3 hari, vendor langganan lagi overload. Ada info tempat cetak kilat?' },
  // Startup (teknologi)
  { comm: 'startup-founders-jakarta', title: 'Mending hire Senior Dev 1 orang atau Junior Dev 3 orang?', content: 'Budget cuma 25jt sebulan buat tech team. Produk masih MVP dan butuh rilis fitur cepet. Agak dilema antara quality vs quantity.' },
  { comm: 'startup-founders-jakarta', title: 'Review ikutan program inkubator YC vs lokal', content: 'Ada yang pernah masuk program akselerator lokal kayak Indigo atau lainnya? Dibandingkan cuma ngejar VC asing, worth it kah network lokalnya?' },
  // Kosmetik (retail)
  { comm: 'agen-reseller-kosmetik', title: 'Tips live TikTok nggak garing walau yang nonton cuma 10 orang', content: 'Kadang mental down kalau pas live sepi. Gimana cara kakak-kakak disini manjangin nafas biar tahan ngoceh 2 jam?' },
  { comm: 'agen-reseller-kosmetik', title: 'Produk sunscreen lokal yang gampang banget up-sell nya', content: 'Lagi nyari produk add-on yang gampang ditawarin waktu customer beli pelembab. Merek lokal apa yang sunscreen-nya cepet muter?' },
  // Properti (properti)
  { comm: 'pengusaha-properti-pemula', title: 'Kosan kamar mandi dalam vs luar, marginnya lebih bagus mana?', content: 'Kamar mandi dalam biaya bangunnya mahal dan maintenance pipa bocor repot. Tapi kalau luar takut sepi peminat. Pengalaman juragan disini gimana?' },
  { comm: 'pengusaha-properti-pemula', title: 'Legalitas merubah rumah tinggal jadi rumah kos 10 pintu', content: 'Tetangga pada protes, katanya harus izin IMB khusus dan izin tetangga. Apa emang seribet itu atau bisa lewat jalur belakang?' }
];

const DUMMY_ANSWERS = [
  "Nyimak dulu ah, kebetulan lagi nyari info yang sama.",
  "Kalau pengalaman saya sih jangan dipaksain kalau memang nggak sanggup. Mending pelan-pelan tapi pasti.",
  "Bener banget! Kemarin saya juga ngalamin hal yang sama. Solusinya ya harus tegas dari awal.",
  "Coba gabung grup WA sebelah deh, disana banyak yang bahas ini detail banget.",
  "Saran saya mending cari vendor lain aja kak, jangan buang waktu nungguin yang nggak pasti.",
  "Wah menarik nih, izin bookmark ya kak buat referensi ke depan.",
  "Setuju! Edukasi market itu emang mahal banget biayanya.",
  "Tergantung budget sih, kalau ada dana lebih mending bayar profesional aja biar beres."
];

async function fixAndSeed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // 1. Fix Broken Avatars
    console.log('Fixing avatars...');
    await client.query(
      "UPDATE public.communities SET avatar_url = 'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=200&q=80' WHERE slug = 'exportir-muda-nusantara'"
    );
    await client.query(
      "UPDATE public.communities SET avatar_url = 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=200&q=80' WHERE slug = 'komunitas-jasa-kreatif-jatim'"
    );

    // 2. Insert Random Questions
    const commsRes = await client.query('SELECT id, slug FROM public.communities');
    const commMap = {};
    commsRes.rows.forEach(c => commMap[c.slug] = c.id);

    const usersRes = await client.query("SELECT id FROM public.users WHERE email NOT LIKE '%@example.com'");
    const users = usersRes.rows;

    let qCount = 0;
    
    // Randomize the order of questions
    const shuffledQuestions = MORE_QUESTIONS.sort(() => 0.5 - Math.random());
    
    // Pick a random number between 12 and 20 to insert
    const insertCount = Math.floor(Math.random() * 5) + 12;

    for (let i = 0; i < insertCount; i++) {
      const q = shuffledQuestions[i];
      if (!q) break;
      const commId = commMap[q.comm];
      if (!commId) continue;

      const qAuthor = users[Math.floor(Math.random() * users.length)];
      
      const qInsert = await client.query(`
        INSERT INTO public.questions (title, content, author_id, community_id, views_count)
        VALUES ($1, $2, $3, $4, $5) RETURNING id
      `, [q.title, q.content, qAuthor.id, commId, Math.floor(Math.random()*400) + 20]);
      
      const questionId = qInsert.rows[0].id;
      qCount++;
      
      // Randomize answers (0 to 3 answers)
      const numAnswers = Math.floor(Math.random() * 4);
      const answerAuthors = [...users].sort(() => 0.5 - Math.random()).slice(0, numAnswers);
      
      for (const aAuthor of answerAuthors) {
        if (aAuthor.id === qAuthor.id) continue;
        const ansContent = DUMMY_ANSWERS[Math.floor(Math.random() * DUMMY_ANSWERS.length)];
        await client.query(`
          INSERT INTO public.answers (question_id, author_id, content) VALUES ($1, $2, $3)
        `, [questionId, aAuthor.id, ansContent]);
      }
      
      // Update answers count
      if (answerAuthors.length > 0) {
        await client.query('UPDATE public.questions SET answers_count = $1 WHERE id = $2', [answerAuthors.length, questionId]);
      }
    }

    // 3. Update questions_count in communities
    for (const comm of commsRes.rows) {
      const countRes = await client.query('SELECT count(*) FROM public.questions WHERE community_id = $1', [comm.id]);
      await client.query('UPDATE public.communities SET questions_count = $1 WHERE id = $2', [countRes.rows[0].count, comm.id]);
    }

    await client.query('COMMIT');
    console.log(`✅ Fixed avatars and inserted ${qCount} randomized natural questions to communities!`);
  } catch(e) {
    await client.query('ROLLBACK');
    console.error('Error:', e);
  } finally {
    client.release();
    pool.end();
  }
}

fixAndSeed();
