require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

const updates = [
  'ERP lokal', 'grosir dan reseller', 'beriklan di videotron', 'cash buffer',
  'sertifikasi ISO', 'komplain customer', 'merekrut Sales', 'loyalitas pelanggan',
  'memotong gaji', 'Foodcourt'
];

async function updateCommunity() {
  const client = await pool.connect();
  try {
    for (const title of updates) {
      const res = await client.query('UPDATE public.questions SET community_id = NULL WHERE title ILIKE $1 RETURNING id', ['%' + title + '%']);
      console.log('Removed community_id for:', title, 'Rows:', res.rowCount);
    }
  } finally {
    client.release();
    pool.end();
  }
}
updateCommunity().catch(console.error);
