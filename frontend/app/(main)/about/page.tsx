import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Target, Users, Heart, Lightbulb, TrendingUp, Sparkles, Globe } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Tentang DiskusiBisnis',
  description: 'Membangun ekosistem UMKM Indonesia yang lebih kuat melalui kolaborasi dan berbagi pengetahuan.'
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 transition-colors duration-200">
      <div className="max-w-3xl mx-auto px-6 py-8 md:py-12">

        {/* Navigation */}
        <nav className="mb-8">
          <Link
            href="/explore"
            className="group inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Kembali
          </Link>
        </nav>

        {/* Hero Section */}
        <header className="mb-12 md:mb-16">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 mb-4 leading-tight">
            Tempat kumpul dan majunya <span className="text-emerald-600 dark:text-emerald-400">UMKM Indonesia</span>.
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
            DiskusiBisnis hadir sebagai wadah buat para pengusaha lokal untuk saling bertanya, berbagi pengalaman jualan, dan bantu satu sama lain supaya usahanya bisa naik kelas bareng-bareng.
          </p>
        </header>

        <div className="space-y-12 md:space-y-16">
          {/* Mission & Vision */}
          <section className="grid md:grid-cols-2 gap-8 md:gap-12">
            <div>
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 mb-4">
                <Target className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">Misi Kami</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Bikin ilmu bisnis jadi gratis dan gampang diakses. Kami pengen semua orang yang lagi merintis usaha—dari jualan online sampai buka ruko—bisa dapat jawaban dan masukan langsung dari praktisinya.
              </p>
            </div>
            <div>
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 mb-4">
                <Lightbulb className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">Visi Kami</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Jadi tongkrongan digital paling asik buat UMKM se-Indonesia. Tempat di mana kita nggak saling sikut, tapi malah kolaborasi bareng biar bisnisnya makin laris.
              </p>
            </div>
          </section>

          {/* Stats - Minimalist */}
          <section className="border-y border-slate-200 dark:border-slate-800 py-8 md:py-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">10k+</div>
                <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Anggota</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">50k+</div>
                <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Solusi</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">100+</div>
                <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Topik</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">24/7</div>
                <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Aktif</div>
              </div>
            </div>
          </section>

          {/* Values / Offerings */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <span className="w-6 h-[2px] bg-emerald-600"></span>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Kenapa Harus Gabung?</span>
            </div>

            <div className="space-y-8">
              <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                <div className="shrink-0">
                  <div className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center">
                    <Users className="w-4 h-4 text-slate-500" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Beneran Komunitas</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Bukan cuma forum biasa. Di sini, kamu bisa nemuin partner bisnis, kenalan baru, atau sekadar teman ngobrol yang sama-sama paham pusingnya ngurusin usaha.
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                <div className="shrink-0">
                  <div className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-slate-500" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Tips yang Masuk Akal</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Kita lebih suka ngobrolin hal-hal praktis. Nggak melulu teori muluk-muluk, tapi strategi jualan yang beneran bisa langsung kamu praktekkin hari ini juga.
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                <div className="shrink-0">
                  <div className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center">
                    <Heart className="w-4 h-4 text-slate-500" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Ramah Buat Pemula</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Nggak usah takut atau malu buat nanya. Di sini nggak ada pertanyaan bodoh. Semua orang pernah mulai dari nol, jadi kita bakal saling bantu dan kasih semangat.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="bg-emerald-50 rounded-2xl p-8 text-center border border-emerald-100">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-3">Yuk, mulai diskusi!</h2>
            <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
              Gabung bareng teman-teman pengusaha lainnya dan temukan jawaban buat kendala bisnismu hari ini.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/register"
                className="px-6 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-full hover:bg-emerald-700 transition-all shadow-sm shadow-emerald-600/20"
              >
                Buat Akun Gratis
              </Link>
              <Link
                href="/communities"
                className="px-6 py-2.5 bg-white text-slate-700 text-sm font-medium rounded-full border border-slate-300 hover:border-emerald-300 hover:text-emerald-600 transition-all"
              >
                Lihat Topik Dulu
              </Link>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
