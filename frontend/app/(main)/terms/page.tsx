import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Syarat & Ketentuan',
  description: 'Aturan penggunaan platform DiskusiBisnis.'
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-200">
      <div className="max-w-3xl mx-auto px-6 py-12 md:py-20">

        {/* Navigation */}
        <nav className="mb-12">
          <Link
            href="/explore"
            className="group inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Kembali
          </Link>
        </nav>

        {/* Header */}
        <header className="mb-16 border-b border-slate-100 dark:border-slate-800 pb-10">
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-6">Syarat & Ketentuan</h1>
          <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 text-sm">
            <span className="flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              Berlaku mulai: 1 Januari 2025
            </span>
          </div>
        </header>

        {/* Content */}
        <div className="prose prose-slate prose-lg max-w-none prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-slate-100 prose-p:text-slate-600 dark:prose-p:text-slate-400 prose-li:text-slate-600 dark:prose-li:text-slate-400 prose-a:text-emerald-600 dark:prose-a:text-emerald-400 hover:prose-a:text-emerald-700">
          <p className="lead text-xl text-slate-600 dark:text-slate-400 mb-12">
            Selamat datang di DiskusiBisnis. Dengan menggunakan platform ini, Anda setuju untuk membangun komunitas yang sehat dan produktif.
          </p>

          <section className="mb-12">
            <h3>1. Etika Komunitas</h3>
            <p>Kami menjunjung tinggi diskusi yang konstruktif. Anda dilarang:</p>
            <ul>
              <li>Melakukan ujaran kebencian, pelecehan, atau bullying.</li>
              <li>Menyebarkan informasi palsu (hoax) atau menyesatkan.</li>
              <li>Melakukan spam atau promosi berlebihan (spamming).</li>
              <li>Membagikan konten ilegal atau melanggar hak cipta.</li>
            </ul>
          </section>

          <section className="mb-12">
            <h3>2. Konten Pengguna</h3>
            <p>
              Anda bertanggung jawab penuh atas konten yang Anda posting. Dengan memposting, Anda memberikan
              kami lisensi non-eksklusif untuk menampilkan dan mendistribusikan konten tersebut di platform ini.
              Kami berhak menghapus konten yang melanggar aturan komunitas.
            </p>
          </section>

          <section className="mb-12">
            <h3>3. Reputasi & Moderasi</h3>
            <p>
              Sistem reputasi kami dirancang untuk menghargai kontribusi positif. Manipulasi sistem reputasi
              (seperti vote farming) dilarang dan dapat mengakibatkan pembekuan akun. Moderator berhak
              mengambil tindakan atas pelanggaran aturan.
            </p>
          </section>

          <section className="mb-12">
            <h3>4. Penafian (Disclaimer)</h3>
            <p>
              Konten di platform ini adalah untuk tujuan informasi dan diskusi umum. Kami tidak memberikan
              nasihat bisnis, hukum, atau keuangan profesional. Selalu konsultasikan keputusan bisnis penting
              Anda dengan profesional yang berkualifikasi.
            </p>
          </section>

          <section className="bg-slate-50 dark:bg-slate-800 p-8 rounded-2xl border border-slate-100 dark:border-slate-700 not-prose mt-16">
            <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">Butuh klarifikasi?</h4>
            <p className="text-slate-600 dark:text-slate-400 mb-4">Kami siap menjelaskan aturan main komunitas ini.</p>
            <Link href="/help" className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline">
              Hubungi Tim Moderasi &rarr;
            </Link>
          </section>

        </div>
      </div>
    </div>
  );
}
