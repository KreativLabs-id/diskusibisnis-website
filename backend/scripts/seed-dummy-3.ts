import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const DUMMY_QUESTIONS = [
  {
    title: "Review penggunaan software ERP lokal vs luar untuk pabrik skala menengah",
    content: "Ada yang punya pengalaman pakai ERP buatan lokal seperti HashMicro atau Ukirama dibandingkan Odoo/SAP B1? Pabrik saya sekitar 100 karyawan, butuh yang support produksi dan inventory yang akurat tapi budget implementasinya nggak mau terlalu gila. Mohon masukannya.",
    tags: ["teknologi", "manajemen", "produksi"]
  },
  {
    title: "Strategi menentukan harga grosir dan reseller agar tidak merusak harga pasar",
    content: "Saya baru mulai buka sistem keagenan. Gimana cara hitung tiering harga dari Distributor Utama -> Agen -> Reseller -> End User agar margin tiap tier cukup tapi harga di konsumen akhir (MSRP) tetap wajar dan nggak overprice?",
    tags: ["reseller", "pricing", "distribusi"]
  },
  {
    title: "Apakah beriklan di videotron saat ini masih efektif dibandingkan digital ads?",
    content: "Saya lihat videotron di jalan protokol harganya luar biasa mahal. Dengan budget yang sama (sekitar 50jt), apakah ROI videotron sepadan untuk brand awareness bisnis F&B lokal dibandingkan kalau saya bakar uang di Instagram/Tiktok Ads?",
    tags: ["marketing", "iklan", "fnb"]
  },
  {
    title: "Berapa lama idealnya cash buffer (dana darurat perusahaan) harus disiapkan?",
    content: "Sebagai UMKM yang sedang berkembang, saya disarankan menyimpan cash buffer. Apakah 3 bulan biaya operasional sudah cukup? Atau harus 6 bulan? Mengingat kalau terlalu banyak uang mengendap rasanya sayang tidak diputar untuk ekspansi.",
    tags: ["keuangan", "cashflow", "umkm"]
  },
  {
    title: "Pengalaman daftar sertifikasi ISO 9001 untuk perusahaan jasa",
    content: "Klien B2B saya mulai banyak yang tanya soal sertifikasi ISO 9001. Prosesnya mengurusnya dari awal sampai akhir itu kira-kira butuh waktu berapa lama ya? Dan apakah wajib pakai konsultan?",
    tags: ["legalitas", "sertifikasi", "b2b"]
  },
  {
    title: "Cara handle komplain customer yang viral di Twitter / TikTok",
    content: "Belakangan ini sering lihat brand yang di-spill di X/Twitter karena masalah sepele lalu viral. Kalau mitigasi krisis seperti ini, langkah pertama yang harus dilakukan PR (Public Relations) atau owner apa ya? Langsung minta maaf atau investigasi dulu?",
    tags: ["customer-service", "social-media", "krisis"]
  },
  {
    title: "Tips merekrut Sales B2B yang jago closing, bukan cuma jago ngomong",
    content: "Saya udah ganti tim sales 3 kali tahun ini. Rata-rata saat interview ngomongnya bagus, tapi pas disuruh canvassing dan kejar target melempem. Adakah pertanyaan interview spesifik atau tes untuk memfilter sales yang mentalnya benar-benar tangguh?",
    tags: ["hrd", "sales", "rekrutmen"]
  },
  {
    title: "Efektivitas program loyalitas pelanggan (poin/member card)",
    content: "Bisnis saya retail pakaian. Ingin bikin member card digital (sistem poin). Kira-kira sistem seperti ini beneran bisa naikin retention rate pembeli nggak ya? Karena jujur saja saya sendiri kadang malas ngumpulin poin kalau belanja.",
    tags: ["retail", "marketing", "customer-retention"]
  },
  {
    title: "Legalitas memotong gaji karyawan yang sering terlambat",
    content: "Mohon pencerahan dari sisi UU Ketenagakerjaan. Boleh nggak sih perusahaan memberlakukan pemotongan gaji (misal Rp 10.000 per 10 menit) untuk karyawan yang datang telat secara terus-menerus tanpa alasan yang jelas?",
    tags: ["hrd", "legal", "karyawan"]
  },
  {
    title: "Perbandingan sewa ruko di pinggir jalan vs buka di Foodcourt/Pujasera",
    content: "Untuk bisnis minuman kekinian, lebih baik sewa ruko sendiri (tapi agak masuk gang/jalanan sepi) atau gabung di Pujasera/Foodcourt yang traffic-nya udah ada tapi harus bagi hasil/sewa lebih mahal? Target pasarnya anak kampus dan keluarga.",
    tags: ["fnb", "lokasi", "franchise"]
  }
];

const DUMMY_ANSWERS = [
  "Kalau pengalaman saya sih, pakai yang lokal lebih aman karena tim support-nya gampang dihubungi dan harganya pakai Rupiah. Nggak pusing kurs.",
  "Setuju! Sebaiknya hitung mundur dari harga jual ke end-user. Distributor maksimal 40%, Agen 25%, Reseller 15%. Sisanya buat operasional.",
  "Videotron itu bagus untuk prestige dan awareness masif, tapi kalau tujuannya direct conversion/penjualan, mending full ke digital ads saja.",
  "Minimal 6 bulan operasional kalau menurut saya. Kita belajar dari pandemi kemarin, 3 bulan itu kerasa banget cepat habisnya kalau pemasukan benar-benar nol.",
  "Bisa urus sendiri asalkan ada satu orang di tim yang benar-benar paham dokumentasi mutu. Tapi rata-rata pakai konsultan biar lebih cepat dan terarah, sekitar 3-4 bulan beres.",
  "Investigasi dulu tapi secara internal HARUS CEPAT (max 1x24 jam). Di publik, keluarkan statement netral seperti 'Kami sedang menelusuri kejadian ini' supaya mereka merasa direspons.",
  "Coba tes roleplay saat interview, kasih skenario ditolak mentah-mentah sama prospek. Lihat reaksinya. Sales bagus biasanya nggak gampang baper dan bisa improvisasi.",
  "Member card itu ngefek banget asalkan reward-nya jelas dan mudah dicapai. Jangan sampai harus ngumpulin 1000 poin cuma buat gratis teh manis.",
  "Sesuai aturan, pemotongan gaji karena alasan indisipliner itu dibolehkan asalkan tertulis jelas di Perjanjian Kerja (PK) atau Peraturan Perusahaan (PP) yang disahkan Disnaker.",
  "Mending pujasera mas. Minuman kekinian itu butuh impulsive buyer. Orang makan di pujasera pasti haus dan beli minum. Kalau di ruko sepi, effort narik orangnya jauh lebih berat."
];

async function seed() {
  console.log('🌱 Starting 3rd Dummy Seeding (Real-time Simulation)...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Get real users (excluding dummy/admin based on your preference)
    const usersRes = await client.query(`
      SELECT id, display_name FROM public.users 
      WHERE email NOT LIKE '%@example.com' 
      AND email != 'admin@diskusibisnis.com'
    `);
    
    if (usersRes.rows.length < 5) {
      throw new Error('Not enough real users found. Need at least 5.');
    }
    const users = usersRes.rows;
    console.log(`✅ Found ${users.length} real users for the simulation.`);

    // Helper: random item from array
    const getRandom = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
    
    // Helper: generate a random time TODAY (from 00:00 to current time)
    const getRandomTimeToday = () => {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const randomTime = startOfDay.getTime() + Math.random() * (now.getTime() - startOfDay.getTime());
      return new Date(randomTime);
    };

    let totalReputationDistributed = 0;
    const reputationUpdates: Record<string, number> = {}; // Track reputation per user

    const addReputation = (userId: string, points: number) => {
      reputationUpdates[userId] = (reputationUpdates[userId] || 0) + points;
      totalReputationDistributed += points;
    };

    // 2. Insert Communities
    const commRes = await client.query('SELECT id FROM public.communities LIMIT 5');
    const communities = commRes.rows;
    
    // 3. Insert Questions
    for (let i = 0; i < DUMMY_QUESTIONS.length; i++) {
      const qData = DUMMY_QUESTIONS[i];
      const author = getRandom(users);
      const community = communities.length > 0 ? getRandom(communities) : null;
      
      const qCreatedAt = getRandomTimeToday();

      const qInsert = await client.query(
        `INSERT INTO public.questions (title, content, author_id, community_id, views_count, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $6) 
         RETURNING id`,
        [qData.title, qData.content, author.id, community?.id || null, Math.floor(Math.random() * 500) + 50, qCreatedAt]
      );
      
      const questionId = qInsert.rows[0].id;
      console.log(`\n📝 Q: "${qData.title.substring(0, 40)}..." by ${author.display_name} (at ${qCreatedAt.getHours().toString().padStart(2, '0')}:${qCreatedAt.getMinutes().toString().padStart(2, '0')})`);

      // Add Upvotes for Question (+10 rep to author per vote)
      const numQUpvotes = Math.floor(Math.random() * 4) + 1; // 1 to 4 upvotes
      const qVoters = [...users].sort(() => 0.5 - Math.random()).slice(0, numQUpvotes);
      
      for (const voter of qVoters) {
        if (voter.id !== author.id) { // no self vote
          await client.query(
            `INSERT INTO public.votes (user_id, question_id, vote_type) VALUES ($1, $2, 'upvote')`,
            [voter.id, questionId]
          );
          addReputation(author.id, 10);
        }
      }
      console.log(`   👍 Question got ${numQUpvotes} upvotes (+${numQUpvotes * 10} rep to ${author.display_name})`);

      // 4. Insert Answers for this Question
      const numAnswers = Math.floor(Math.random() * 3) + 2; // 2 to 4 answers
      const answerAuthors = [...users]
        .filter(u => u.id !== author.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, numAnswers);
      
      let hasAccepted = false;

      for (let j = 0; j < answerAuthors.length; j++) {
        const aAuthor = answerAuthors[j];
        const aContent = DUMMY_ANSWERS[Math.floor(Math.random() * DUMMY_ANSWERS.length)];
        
        // Ensure answer is created AFTER the question
        const aCreatedAt = new Date(qCreatedAt.getTime() + (Math.random() * 3 * 60 * 60 * 1000)); // up to 3 hours later
        if (aCreatedAt > new Date()) aCreatedAt.setTime(new Date().getTime() - 1000); // cap at current time

        const isAccepted = !hasAccepted && Math.random() > 0.5; // 50% chance to be accepted if no other is
        if (isAccepted) hasAccepted = true;

        const aInsert = await client.query(
          `INSERT INTO public.answers (question_id, author_id, content, is_accepted, created_at, updated_at) 
           VALUES ($1, $2, $3, $4, $5, $5)
           RETURNING id`,
          [questionId, aAuthor.id, aContent, isAccepted, aCreatedAt]
        );

        const answerId = aInsert.rows[0].id;
        
        // Base reputation for answering
        addReputation(aAuthor.id, 2);
        
        // Accepted reputation
        if (isAccepted) {
          addReputation(aAuthor.id, 15);
        }

        let aLog = `   💬 Answer by ${aAuthor.display_name} (Acc: ${isAccepted}) [+2 rep]`;

        // Upvotes for Answer (+10 rep per upvote)
        const numAUpvotes = Math.floor(Math.random() * 3); // 0 to 2 upvotes
        const aVoters = [...users].sort(() => 0.5 - Math.random()).slice(0, numAUpvotes);
        
        for (const voter of aVoters) {
          if (voter.id !== aAuthor.id) {
            await client.query(
              `INSERT INTO public.votes (user_id, answer_id, vote_type) VALUES ($1, $2, 'upvote')`,
              [voter.id, answerId]
            );
            addReputation(aAuthor.id, 10);
            aLog += ` [+10 upvote]`;
          }
        }
        
        console.log(aLog);
      }

      // Update question answer count
      await client.query(
        'UPDATE public.questions SET answers_count = $1 WHERE id = $2',
        [answerAuthors.length, questionId]
      );
    }

    // 5. Apply Reputation Updates to Users Table
    for (const [userId, points] of Object.entries(reputationUpdates)) {
      await client.query(
        'UPDATE public.users SET reputation_points = COALESCE(reputation_points, 0) + $1 WHERE id = $2',
        [points, userId]
      );
    }

    await client.query('COMMIT');
    console.log(`\n✅ Seeding 10 Real-time Questions completed successfully!`);
    console.log(`📈 Total ${totalReputationDistributed} reputation points distributed across users.`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding dummy data:', error);
  } finally {
    client.release();
    pool.end();
  }
}

seed();
