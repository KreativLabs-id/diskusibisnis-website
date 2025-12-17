import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Shield, Lock, Eye, FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Kebijakan Privasi',
  description: 'Komitmen kami dalam melindungi data dan privasi pengguna.'
};

export default function PrivacyPage() {
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
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-6">Kebijakan Privasi</h1>
          <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 text-sm">
            <span className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Terakhir diperbarui: 16 November 2025
            </span>
          </div>
        </header>

        {/* Content */}
        <div className="prose prose-slate prose-lg max-w-none prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-slate-100 prose-p:text-slate-600 dark:prose-p:text-slate-400 prose-li:text-slate-600 dark:prose-li:text-slate-400 prose-a:text-emerald-600 dark:prose-a:text-emerald-400 hover:prose-a:text-emerald-700">
          <p className="lead text-xl text-slate-600 dark:text-slate-400 mb-12">
            Privasi Anda adalah prioritas kami. Dokumen ini menjelaskan transparansi kami dalam mengelola data Anda di platform DiskusiBisnis.
          </p>

          <section className="mb-12">
            <h3>1. Informasi yang Kami Kumpulkan</h3>
            <p>Kami mengumpulkan informasi terbatas yang diperlukan untuk menyediakan layanan terbaik bagi komunitas:</p>
            <ul>
              <li><strong>Informasi Akun:</strong> Nama, email, dan foto profil saat Anda mendaftar.</li>
              <li><strong>Konten:</strong> Pertanyaan, jawaban, dan diskusi yang Anda publikasikan.</li>
              <li><strong>Interaksi:</strong> Vote, bookmark, dan reputasi yang Anda peroleh.</li>
              <li><strong>Teknis:</strong> Log akses dasar dan cookies untuk fungsionalitas login.</li>
            </ul>
          </section>

          <section className="mb-12">
            <h3>2. Penggunaan Informasi</h3>
            <p>Data Anda digunakan semata-mata untuk operasional platform:</p>
            <ul>
              <li>Memungkinkan Anda berinteraksi dengan pengguna lain.</li>
              <li>Membangun sistem reputasi dan kredibilitas.</li>
              <li>Mengirimkan notifikasi relevan (yang bisa Anda atur).</li>
              <li>Mencegah spam dan penyalahgunaan platform.</li>
            </ul>
          </section>

          <section className="mb-12">
            <h3>3. Perlindungan & Keamanan</h3>
            <p>
              Kami menerapkan standar keamanan industri untuk melindungi data Anda. Password dienkripsi,
              koneksi menggunakan HTTPS, dan akses ke database dibatasi ketat. Kami tidak akan pernah
              menjual data pribadi Anda kepada pihak ketiga untuk tujuan pemasaran.
            </p>
          </section>

          <section className="mb-12">
            <h3>4. Kendali Anda</h3>
            <p>Anda memiliki kendali penuh atas data Anda:</p>
            <ul>
              <li>Anda bisa mengedit atau menghapus profil Anda kapan saja.</li>
              <li>Anda bisa meminta salinan data yang kami miliki (Export Data).</li>
              <li>Anda bisa menghapus akun secara permanen melalui Pengaturan.</li>
            </ul>
          </section>

          <section className="bg-slate-50 dark:bg-slate-800 p-8 rounded-2xl border border-slate-100 dark:border-slate-700 not-prose mt-16">
            <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">Punya pertanyaan tentang privasi?</h4>
            <p className="text-slate-600 dark:text-slate-400 mb-4">Tim kami siap membantu menjelaskan praktik data kami.</p>
            <Link href="/help" className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline">
              Hubungi Pusat Bantuan &rarr;
            </Link>
          </section>

        </div>
      </div>
    </div>
  );
}
