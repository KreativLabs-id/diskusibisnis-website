import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Target, Users, Heart, Lightbulb, TrendingUp, Sparkles, Globe } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Tentang DiskusiBisnis - Platform Q&A UMKM Indonesia',
  description: 'Pelajari lebih lanjut tentang DiskusiBisnis, platform tanya jawab untuk UMKM Indonesia'
};

export default function AboutPage() {
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

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 p-6 text-white">
            <h1 className="text-3xl font-bold mb-3">Tentang DiskusiBisnis</h1>
            <p className="text-lg opacity-90">
              Platform Q&A untuk UMKM Indonesia yang membangun komunitas pengusaha yang saling mendukung
            </p>
          </div>

          {/* Content */}
          <div className="p-8 space-y-8">
            {/* Intro */}
            <section>
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-xl border border-emerald-200">
                <p className="text-lg text-slate-800 leading-relaxed">
                  <strong className="text-emerald-700">DiskusiBisnis</strong> adalah platform komunitas 
                  Q&A pertama di Indonesia yang didedikasikan khusus untuk <strong>UMKM</strong>. 
                  Kami percaya bahwa setiap pengusaha berhak mendapat akses ke pengetahuan bisnis berkualitas, 
                  networking yang meaningful, dan support system yang kuat — tanpa batasan finansial atau geografis.
                </p>
              </div>
            </section>

            {/* Mission */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Target size={24} className="text-emerald-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Misi Kami</h2>
              </div>
              <p className="text-lg text-slate-700 leading-relaxed">
                Memberdayakan UMKM Indonesia dengan menyediakan platform tanya jawab yang memudahkan 
                pengusaha untuk mendapatkan solusi, berbagi pengetahuan, dan membangun jaringan bisnis 
                yang kuat. Kami hadir untuk mendemokratisasi akses ke pengetahuan bisnis dan menciptakan 
                ekosistem kolaboratif dimana setiap pengusaha bisa tumbuh bersama.
              </p>
            </section>

            {/* Vision */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Lightbulb size={24} className="text-emerald-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Visi Kami</h2>
              </div>
              <p className="text-lg text-slate-700 leading-relaxed">
                Menjadi platform komunitas UMKM terbesar di Indonesia yang menghubungkan pengusaha 
                dengan jawaban, mentor, partner, dan peluang investasi untuk mengembangkan bisnis 
                mereka.
              </p>
            </section>

            {/* What We Offer */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <TrendingUp size={24} className="text-emerald-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Apa yang Kami Tawarkan?</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3 mb-3">
                    <Users size={22} className="text-emerald-600" />
                    <h3 className="text-lg font-semibold text-slate-900">Networking</h3>
                  </div>
                  <p className="text-slate-700">
                    Bangun koneksi dengan ribuan pengusaha UMKM di seluruh Indonesia. 
                    Temukan partner bisnis, kolaborator, dan teman seperjuangan.
                  </p>
                </div>

                <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3 mb-3">
                    <Lightbulb size={22} className="text-emerald-600" />
                    <h3 className="text-lg font-semibold text-slate-900">Belajar Strategi</h3>
                  </div>
                  <p className="text-slate-700">
                    Dapatkan insight dan strategi bisnis dari pengusaha berpengalaman. 
                    Akses pengetahuan tentang marketing, sales, operasional, dan keuangan.
                  </p>
                </div>

                <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3 mb-3">
                    <Target size={22} className="text-emerald-600" />
                    <h3 className="text-lg font-semibold text-slate-900">Dapat Partner</h3>
                  </div>
                  <p className="text-slate-700">
                    Temukan partner bisnis yang tepat untuk mengembangkan usaha. 
                    Dari supplier, distributor, hingga co-founder.
                  </p>
                </div>

                <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3 mb-3">
                    <Heart size={22} className="text-emerald-600" />
                    <h3 className="text-lg font-semibold text-slate-900">Mentorship & Investor</h3>
                  </div>
                  <p className="text-slate-700">
                    Akses ke mentor berpengalaman dan peluang investasi. 
                    Dapatkan bimbingan untuk scale-up bisnis Anda.
                  </p>
                </div>
              </div>
            </section>

            {/* Why Join */}
            <section className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-xl border border-emerald-200">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Kenapa Harus Bergabung?</h2>
              <ul className="space-y-3 text-slate-700">
                <li className="flex items-start gap-3">
                  <span className="text-emerald-600 text-xl">✓</span>
                  <span><strong>Gratis selamanya</strong> - Tidak ada biaya berlangganan atau hidden fee</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-600 text-xl">✓</span>
                  <span><strong>Komunitas aktif</strong> - Ribuan pengusaha UMKM siap membantu menjawab pertanyaan Anda</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-600 text-xl">✓</span>
                  <span><strong>Expert verified</strong> - Jawaban dari praktisi dan ahli yang terverifikasi</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-600 text-xl">✓</span>
                  <span><strong>Topik lengkap</strong> - Dari digital marketing hingga legalitas bisnis</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-600 text-xl">✓</span>
                  <span><strong>Peluang kolaborasi</strong> - Temukan partner, supplier, dan investor</span>
                </li>
              </ul>
            </section>

            {/* Stats */}
            <section className="bg-gradient-to-r from-emerald-700 to-emerald-600 p-6 rounded-xl text-white">
              <h2 className="text-xl font-bold mb-4 text-center">DiskusiBisnis dalam Angka</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">10,000+</div>
                  <div className="text-emerald-100 text-sm">Anggota Aktif</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">50,000+</div>
                  <div className="text-emerald-100 text-sm">Pertanyaan Dijawab</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">100+</div>
                  <div className="text-emerald-100 text-sm">Topik Bisnis</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">24/7</div>
                  <div className="text-emerald-100 text-sm">Support Komunitas</div>
                </div>
              </div>
            </section>

            {/* More Info */}
            <section className="bg-emerald-50 p-6 rounded-xl border border-emerald-200">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Sparkles size={22} className="text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    Ingin Tahu Lebih Detail Tentang Komunitas?
                  </h3>
                  <p className="text-slate-700 mb-4">
                    Pelajari visi, misi, target anggota, dan semua manfaat bergabung di komunitas kami.
                  </p>
                  <Link
                    href="/about-community"
                    className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold"
                  >
                    Baca Tentang Komunitas →
                  </Link>
                </div>
              </div>
            </section>

            {/* CTA */}
            <section className="text-center py-6">
              <h2 className="text-xl font-bold text-slate-900 mb-3">
                Siap Bergabung dengan Komunitas?
              </h2>
              <p className="text-slate-600 mb-6">
                Mulai tanya, jawab, dan kembangkan bisnis Anda bersama ribuan pengusaha lainnya. 100% Gratis!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/register"
                  className="px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold"
                >
                  Daftar Sekarang
                </Link>
                <Link
                  href="/communities"
                  className="px-8 py-3 border-2 border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors font-semibold"
                >
                  Jelajahi Komunitas
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
