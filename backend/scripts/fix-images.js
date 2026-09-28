require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

const updates = [
  { title: 'ERP lokal', img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80' },
  { title: 'grosir dan reseller', img: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80' },
  { title: 'beriklan di videotron', img: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800&q=80' },
  { title: 'cash buffer', img: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80' },
  { title: 'sertifikasi ISO', img: 'https://images.unsplash.com/photo-1554224155-1696413565d3?w=800&q=80' },
  { title: 'komplain customer', img: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&q=80' },
  { title: 'merekrut Sales', img: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80' },
  { title: 'loyalitas pelanggan', img: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80' },
  { title: 'memotong gaji', img: 'https://images.unsplash.com/photo-1501139083538-0139583c060f?w=800&q=80' },
  { title: 'Foodcourt', img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80' }
];

async function updateImages() {
  const client = await pool.connect();
  try {
    for (const u of updates) {
      const res = await client.query('UPDATE questions SET images = $1 WHERE title ILIKE $2 RETURNING id', [JSON.stringify([u.img]), '%' + u.title + '%']);
      console.log('Updated:', u.title, 'Rows:', res.rowCount);
    }
  } finally {
    client.release();
    pool.end();
  }
}
updateImages().catch(console.error);
