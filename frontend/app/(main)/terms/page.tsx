import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, FileText, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Syarat & Ketentuan - DiskusiBisnis',
  description: 'Syarat dan ketentuan penggunaan platform DiskusiBisnis'
};

export default function TermsPage() {
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
              <FileText size={28} className="text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Syarat & Ketentuan</h1>
              <p className="text-slate-600">Terakhir diperbarui: 16 November 2025</p>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-slate max-w-none">
            <section className="mb-8">
              <p className="text-lg text-slate-700 leading-relaxed">
                Selamat datang di DiskusiBisnis! Dengan menggunakan platform kami, Anda setuju untuk 
                terikat dengan syarat dan ketentuan berikut. Mohon baca dengan saksama.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">1. Penerimaan Ketentuan</h2>
              <div className="space-y-4 text-slate-700">
                <p>
                  Dengan mengakses dan menggunakan DiskusiBisnis, Anda menyatakan bahwa:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Anda berusia minimal 17 tahun atau telah mendapat izin orang tua/wali</li>
                  <li>Anda memiliki kapasitas hukum untuk mengikat kontrak</li>
                  <li>Anda menyetujui semua syarat dan ketentuan yang berlaku</li>
                  <li>Informasi yang Anda berikan adalah akurat dan benar</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">2. Akun Pengguna</h2>
              <div className="space-y-4 text-slate-700">
                <h3 className="text-lg font-semibold text-slate-900">Tanggung Jawab Akun</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Anda bertanggung jawab menjaga keamanan akun dan password Anda</li>
                  <li>Anda tidak boleh membagikan akun dengan orang lain</li>
                  <li>Anda harus segera memberitahu kami jika ada penggunaan tidak sah</li>
                  <li>Satu orang hanya boleh memiliki satu akun</li>
                </ul>

                <h3 className="text-lg font-semibold text-slate-900 mt-6">Informasi Akun</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Informasi yang Anda berikan harus akurat dan terkini</li>
                  <li>Anda harus memperbarui informasi jika ada perubahan</li>
                  <li>Penggunaan identitas palsu dilarang keras</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">3. Aturan Penggunaan</h2>
              
              <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-200 mb-6">-6">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle size={22} className="text-emerald-600" />
                  <h3 className="text-lg font-semibold text-slate-900 m-0">Yang BOLEH Dilakukan</h3>
                </div>
                <ul className="list-disc list-inside text-slate-700 space-y-2">
                  <li>Mengajukan pertanyaan yang relevan dengan bisnis dan UMKM</li>
                  <li>Memberikan jawaban yang informatif dan membantu</li>
                  <li>Berbagi pengalaman dan pengetahuan bisnis Anda</li>
                  <li>Memberikan kritik yang konstruktif</li>
                  <li>Membangun networking dan kolaborasi bisnis</li>
                  <li>Menghormati pendapat dan pengalaman orang lain</li>
                </ul>
              </div>

              <div className="bg-red-50 p-6 rounded-xl border border-red-200">
                <div className="flex items-center gap-3 mb-4">
                  <XCircle size={22} className="text-red-600" />
                  <h3 className="text-lg font-semibold text-slate-900 m-0">Yang TIDAK BOLEH Dilakukan</h3>
                </div>
                <ul className="list-disc list-inside text-slate-700 space-y-2">
                  <li>Spam, iklan berlebihan, atau promosi yang tidak relevan</li>
                  <li>Konten yang melanggar hukum atau hak kekayaan intelektual</li>
                  <li>Ujaran kebencian, diskriminasi, atau pelecehan</li>
                  <li>Informasi palsu atau menyesatkan</li>
                  <li>Manipulasi vote atau gaming sistem</li>
                  <li>Konten pornografi atau tidak pantas</li>
                  <li>Malware, virus, atau kode berbahaya</li>
                  <li>Scraping atau harvesting data tanpa izin</li>
                  <li>Meniru atau menyamar sebagai orang/entitas lain</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">4. Konten Pengguna</h2>
              <div className="space-y-4 text-slate-700">
                <h3 className="text-lg font-semibold text-slate-900">Kepemilikan Konten</h3>
                <p>
                  Anda tetap memiliki hak atas konten yang Anda posting. Namun, dengan mem-posting konten, 
                  Anda memberikan DiskusiBisnis lisensi non-eksklusif, bebas royalti, worldwide untuk:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Menampilkan dan mendistribusikan konten Anda di platform</li>
                  <li>Memodifikasi konten untuk tujuan teknis (format, ukuran, dll)</li>
                  <li>Menggunakan konten untuk promosi platform</li>
                </ul>

                <h3 className="text-lg font-semibold text-slate-900 mt-6">Moderasi Konten</h3>
                <p>
                  Kami berhak untuk menghapus atau memodifikasi konten yang:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Melanggar syarat dan ketentuan ini</li>
                  <li>Melanggar hukum yang berlaku</li>
                  <li>Dianggap tidak pantas atau berbahaya</li>
                  <li>Dilaporkan oleh pengguna lain</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">5. Komunitas</h2>
              <div className="space-y-4 text-slate-700">
                <p>
                  Pengguna dapat membuat dan bergabung dengan komunitas. Ketentuan tambahan:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Pembuat komunitas bertanggung jawab atas moderasi komunitas mereka</li>
                  <li>Komunitas harus memiliki tujuan yang jelas dan sesuai dengan platform</li>
                  <li>Admin komunitas dapat menetapkan aturan tambahan untuk komunitasnya</li>
                  <li>Kami berhak menghapus komunitas yang melanggar ketentuan</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">6. Reputasi dan Gamifikasi</h2>
              <div className="space-y-4 text-slate-700">
                <p>
                  Platform menggunakan sistem poin reputasi dan gamifikasi:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Poin diberikan berdasarkan kontribusi positif</li>
                  <li>Manipulasi sistem poin dilarang dan dapat mengakibatkan sanksi</li>
                  <li>Kami berhak menyesuaikan poin jika ditemukan penyalahgunaan</li>
                  <li>Badge dan achievement tidak dapat ditransfer atau dijual</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle size={22} className="text-yellow-600" />
                <h2 className="text-xl font-bold text-slate-900 m-0">7. Pelanggaran dan Sanksi</h2>
              </div>
              <div className="space-y-4 text-slate-700">
                <p>Pelanggaran terhadap syarat dan ketentuan dapat mengakibatkan:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>Peringatan</strong> - Untuk pelanggaran ringan pertama kali</li>
                  <li><strong>Pembatasan fitur</strong> - Temporary suspension dari fitur tertentu</li>
                  <li><strong>Suspensi akun</strong> - Temporary ban dari platform</li>
                  <li><strong>Penghapusan akun</strong> - Permanent ban untuk pelanggaran berat atau berulang</li>
                </ul>
                <p>
                  Keputusan moderasi bersifat final. Anda dapat mengajukan banding melalui halaman Bantuan.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">8. Disclaimer</h2>
              <div className="space-y-4 text-slate-700">
                <p>
                  Platform disediakan "sebagaimana adanya" tanpa jaminan apapun. Kami tidak bertanggung jawab atas:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Akurasi atau kelengkapan konten yang diposting pengguna</li>
                  <li>Keputusan bisnis yang dibuat berdasarkan informasi dari platform</li>
                  <li>Kerugian yang timbul dari penggunaan platform</li>
                  <li>Gangguan layanan atau downtime</li>
                  <li>Kehilangan data</li>
                </ul>
                <p className="font-semibold text-red-600 mt-4">
                  PENTING: Informasi di platform ini untuk tujuan edukasi. Selalu konsultasikan dengan 
                  profesional untuk keputusan bisnis penting.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">9. Batasan Tanggung Jawab</h2>
              <div className="space-y-4 text-slate-700">
                <p>
                  Dalam batas maksimum yang diizinkan hukum, DiskusiBisnis tidak bertanggung jawab atas 
                  kerugian tidak langsung, insidental, khusus, konsekuensial, atau hukuman yang timbul dari 
                  penggunaan atau ketidakmampuan menggunakan platform.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">10. Perubahan Layanan</h2>
              <div className="space-y-4 text-slate-700">
                <p>Kami berhak untuk:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Mengubah, menangguhkan, atau menghentikan layanan kapan saja</li>
                  <li>Mengubah syarat dan ketentuan dengan pemberitahuan</li>
                  <li>Menolak layanan kepada siapa pun karena alasan apapun</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">11. Hukum yang Berlaku</h2>
              <div className="space-y-4 text-slate-700">
                <p>
                  Syarat dan ketentuan ini diatur oleh hukum Republik Indonesia. Setiap sengketa akan 
                  diselesaikan di pengadilan yang berwenang di Jakarta, Indonesia.
                </p>
              </div>
            </section>

            <section className="mb-8 bg-emerald-50 p-6 rounded-xl border border-emerald-200">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Hubungi Kami</h2>
              <p className="text-slate-700 mb-4">
                Jika Anda memiliki pertanyaan tentang Syarat & Ketentuan ini:
              </p>
              <div className="text-slate-700 space-y-2">
                <p><strong>Email:</strong> support@diskusibisnis.com</p>
                <p><strong>Alamat:</strong> Jakarta, Indonesia</p>
                <p>
                  <Link href="/help" className="text-emerald-600 hover:text-emerald-700 font-semibold">
                    Kunjungi Halaman Bantuan →
                  </Link>
                </p>
              </div>
            </section>

            <div className="bg-slate-100 p-6 rounded-xl border border-slate-300">
              <p className="text-slate-700">
                Dengan melanjutkan penggunaan DiskusiBisnis, Anda menyatakan telah membaca, memahami, 
                dan menyetujui Syarat & Ketentuan ini.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
