import Link from 'next/link';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

export default function NotFound() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '1rem',
      backgroundColor: '#f8fafc'
    }}>
      <div style={{ maxWidth: '28rem', width: '100%', textAlign: 'center' }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ 
            width: '6rem', 
            height: '6rem', 
            backgroundColor: '#d1fae5', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 1.5rem' 
          }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#059669' }}>404</span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '0.5rem' }}>
            Halaman Tidak Ditemukan
          </h1>
          <p style={{ color: '#64748b' }}>
            Maaf, halaman yang Anda cari tidak dapat ditemukan atau telah dipindahkan.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Link
            href="/"
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '0.5rem', 
              width: '100%', 
              padding: '0.75rem 1.5rem', 
              backgroundColor: '#059669', 
              color: 'white', 
              borderRadius: '0.5rem', 
              fontWeight: '500',
              textDecoration: 'none'
            }}
          >
            🏠 Kembali ke Beranda
          </Link>
          
          <Link
            href="/questions"
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '0.5rem', 
              width: '100%', 
              padding: '0.75rem 1.5rem', 
              backgroundColor: 'white', 
              border: '1px solid #e2e8f0', 
              color: '#374151', 
              borderRadius: '0.5rem', 
              fontWeight: '500',
              textDecoration: 'none'
            }}
          >
            📖 Lihat Semua Pertanyaan
          </Link>
        </div>

        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
            Butuh bantuan?{' '}
            <Link href="/" style={{ color: '#059669', fontWeight: '500', textDecoration: 'none' }}>
              Hubungi Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
