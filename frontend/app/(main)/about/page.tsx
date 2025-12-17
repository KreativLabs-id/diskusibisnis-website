import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Target, Users, Heart, Lightbulb, TrendingUp, Sparkles, Globe } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Tentang DiskusiBisnis',
  description: 'Membangun ekosistem UMKM Indonesia yang lebih kuat melalui kolaborasi dan berbagi pengetahuan.'
};

export default function AboutPage() {
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

        {/* Hero Section */}
        <header className="mb-16 md:mb-24">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-6 leading-tight">
            Membangun masa depan <span className="text-emerald-600 dark:text-emerald-400">UMKM Indonesia</span>.
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
            DiskusiBisnis adalah platform Q&A yang didedikasikan untuk menghubungkan pengusaha, berbagi strategi nyata, dan tumbuh bersama tanpa batasan.
          </p>
        </header>

        <div className="space-y-20 md:space-y-32">
          {/* Mission & Vision */}
          <section className="grid md:grid-cols-2 gap-12">
            <div>
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 mb-6">
                <Target className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">Misi Kami</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Mendemokratisasi akses pengetahuan bisnis. Kami ingin memastikan setiap pengusaha, sekecil apapun, memiliki akses ke mentorship dan solusi yang mereka butuhkan untuk berkembang.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 mb-6">
                <Lightbulb className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">Visi Kami</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Menjadi ekosistem digital terbesar yang menggerakkan ekonomi mikro Indonesia, di mana kolaborasi menggantikan kompetisi yang tidak sehat.
              </p>
            </div>
          </section>

          {/* Stats - Minimalist */}
          <section className="border-y border-slate-100 dark:border-slate-800 py-12 md:py-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">10k+</div>
                <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Anggota</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">50k+</div>
                <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Solusi</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">100+</div>
                <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Topik</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">24/7</div>
                <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Aktif</div>
              </div>
            </div>
          </section>

          {/* Values / Offerings */}
          <section>
            <div className="flex items-center gap-3 mb-10">
              <span className="w-8 h-[2px] bg-emerald-600"></span>
              <span className="text-sm font-bold text-emerald-600 uppercase tracking-wider">Mengapa Kami Berbeda</span>
            </div>

            <div className="space-y-12">
              <div className="flex flex-col md:flex-row gap-6 md:gap-10">
                <div className="shrink-0">
                  <div className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center">
                    <Users className="w-5 h-5 text-slate-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Komunitas yang Sesungguhnya</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Lebih dari sekadar forum tanya jawab. Ini adalah tempat di mana Anda menemukan partner bisnis, kolaborator, dan teman seperjuangan yang mengerti pahit-manisnya dunia usaha.
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-6 md:gap-10">
                <div className="shrink-0">
                  <div className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-slate-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Fokus pada Pertumbuhan</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Kami memprioritaskan diskusi yang actionable. Bukan teori kosong, tapi strategi yang bisa langsung Anda terapkan hari ini untuk melihat hasil besok.
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-6 md:gap-10">
                <div className="shrink-0">
                  <div className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-slate-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Inklusif & Mendukung</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Kami percaya bahwa tidak ada pertanyaan bodoh. Lingkungan kami dirancang aman dan suportif bagi pemula yang baru memulai langkah pertama mereka.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="bg-emerald-50/50 rounded-3xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">Siap untuk melangkah?</h2>
            <p className="text-slate-600 mb-8 max-w-xl mx-auto">
              Bergabunglah dengan ribuan pengusaha lain yang sudah merasakan dampak positif dari komunitas ini.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="px-8 py-4 bg-emerald-600 text-white font-medium rounded-full hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
              >
                Gabung Sekarang
              </Link>
              <Link
                href="/communities"
                className="px-8 py-4 bg-white text-slate-700 font-medium rounded-full border border-slate-200 hover:border-emerald-300 hover:text-emerald-600 transition-all"
              >
                Lihat Komunitas
              </Link>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
