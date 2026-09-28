require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
pool.query("SELECT email, role FROM public.users WHERE email = 'admin@diskusibisnis.com'").then(res => { console.log(res.rows); process.exit(0) }).catch(console.error);
