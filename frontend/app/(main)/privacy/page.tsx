import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Shield, Lock, Eye, FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Kebijakan Privasi - DiskusiBisnis',
  description: 'Kebijakan privasi DiskusiBisnis tentang pengumpulan, penggunaan, dan perlindungan data pengguna'
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-emerald-600 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Kembali ke Beranda</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          {/* Title */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Shield size={28} className="text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Kebijakan Privasi</h1>
              <p className="text-slate-600">Terakhir diperbarui: 16 November 2025</p>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-slate max-w-none">
            <section className="mb-8">
              <p className="text-lg text-slate-700 leading-relaxed">
                DiskusiBisnis berkomitmen untuk melindungi privasi Anda. Kebijakan Privasi ini menjelaskan 
                bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda.
              </p>
            </section>

            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Eye size={22} className="text-emerald-600" />
                <h2 className="text-xl font-bold text-slate-900 m-0">Informasi yang Kami Kumpulkan</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">1. Informasi Akun</h3>
                  <ul className="list-disc list-inside text-slate-700 space-y-2">
                    <li>Nama lengkap dan nama tampilan</li>
                    <li>Alamat email</li>
                    <li>Password (terenkripsi)</li>
                    <li>Foto profil (opsional)</li>
                    <li>Bio dan informasi profil lainnya</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-900">2. Konten yang Anda Buat</h3>
                  <ul className="list-disc list-inside text-slate-700 space-y-2">
                    <li>Pertanyaan dan jawaban</li>
                    <li>Komentar dan diskusi</li>
                    <li>Vote dan interaksi</li>
                    <li>Komunitas yang Anda ikuti</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-900">3. Data Teknis</h3>
                  <ul className="list-disc list-inside text-slate-700 space-y-2">
                    <li>Alamat IP</li>
                    <li>Browser dan device information</li>
                    <li>Log aktivitas platform</li>
                    <li>Cookies dan teknologi serupa</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <FileText size={22} className="text-emerald-600" />
                <h2 className="text-xl font-bold text-slate-900 m-0">Bagaimana Kami Menggunakan Informasi</h2>
              </div>
              <ul className="list-disc list-inside text-slate-700 space-y-2">
                <li>Menyediakan dan meningkatkan layanan platform</li>
                <li>Memproses registrasi dan autentikasi pengguna</li>
                <li>Menampilkan konten yang relevan untuk Anda</li>
                <li>Mengirim notifikasi penting terkait akun Anda</li>
                <li>Mencegah penyalahgunaan dan fraud</li>
                <li>Menganalisis penggunaan platform untuk perbaikan</li>
                <li>Berkomunikasi dengan Anda tentang update dan fitur baru</li>
              </ul>
            </section>

            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Lock size={22} className="text-emerald-600" />
                <h2 className="text-xl font-bold text-slate-900 m-0">Perlindungan Data</h2>
              </div>
              <div className="space-y-4 text-slate-700">
                <p>
                  Kami menerapkan langkah-langkah keamanan yang sesuai untuk melindungi informasi pribadi Anda:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Enkripsi data sensitif (password, token)</li>
                  <li>HTTPS untuk semua komunikasi</li>
                  <li>Akses terbatas ke data pribadi</li>
                  <li>Regular security audits</li>
                  <li>Backup data berkala</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Berbagi Informasi</h2>
              <div className="space-y-4 text-slate-700">
                <p>Kami <strong>TIDAK</strong> menjual data pribadi Anda kepada pihak ketiga.</p>
                <p>Kami hanya membagikan informasi dalam situasi berikut:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>Dengan persetujuan Anda</strong> - Ketika Anda secara eksplisit menyetujui</li>
                  <li><strong>Service providers</strong> - Provider hosting, analytics yang membantu operasional platform</li>
                  <li><strong>Kepatuhan hukum</strong> - Jika diwajibkan oleh hukum atau proses hukum</li>
                  <li><strong>Perlindungan hak</strong> - Untuk melindungi hak, properti, dan keamanan kami atau pengguna lain</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Hak Anda</h2>
              <div className="space-y-4 text-slate-700">
                <p>Anda memiliki hak untuk:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>Akses</strong> - Melihat informasi pribadi yang kami miliki tentang Anda</li>
                  <li><strong>Koreksi</strong> - Memperbarui atau memperbaiki informasi yang tidak akurat</li>
                  <li><strong>Penghapusan</strong> - Meminta penghapusan akun dan data pribadi Anda</li>
                  <li><strong>Portabilitas</strong> - Mendapatkan salinan data Anda dalam format terstruktur</li>
                  <li><strong>Keberatan</strong> - Menolak pemrosesan tertentu atas data Anda</li>
                </ul>
                <p>
                  Untuk melaksanakan hak-hak ini, silakan hubungi kami melalui halaman Bantuan atau 
                  email ke <strong>privacy@diskusibisnis.com</strong>
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Cookies</h2>
              <div className="space-y-4 text-slate-700">
                <p>
                  Kami menggunakan cookies dan teknologi serupa untuk meningkatkan pengalaman Anda:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>Essential cookies</strong> - Diperlukan untuk fungsi dasar platform</li>
                  <li><strong>Analytics cookies</strong> - Membantu kami memahami penggunaan platform</li>
                  <li><strong>Preference cookies</strong> - Menyimpan preferensi Anda</li>
                </ul>
                <p>
                  Anda dapat mengontrol penggunaan cookies melalui pengaturan browser Anda.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Perubahan Kebijakan</h2>
              <p className="text-slate-700">
                Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Kami akan memberitahu 
                Anda tentang perubahan signifikan melalui email atau notifikasi di platform. Penggunaan 
                berkelanjutan setelah perubahan berarti Anda menerima kebijakan yang diperbarui.
              </p>
            </section>

            <section className="mb-8 bg-emerald-50 p-6 rounded-xl border border-emerald-200">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Hubungi Kami</h2>
              <p className="text-slate-700 mb-4">
                Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini, silakan hubungi:
              </p>
              <div className="text-slate-700 space-y-2">
                <p><strong>Email:</strong> privacy@diskusibisnis.com</p>
                <p><strong>Alamat:</strong> Jakarta, Indonesia</p>
                <p>
                  <Link href="/help" className="text-emerald-600 hover:text-emerald-700 font-semibold">
                    Lihat Halaman Bantuan →
                  </Link>
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
