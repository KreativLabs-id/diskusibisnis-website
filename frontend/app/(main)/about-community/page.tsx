import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Target, 
  Eye, 
  Users, 
  Lightbulb, 
  TrendingUp, 
  Heart,
  Briefcase,
  DollarSign,
  Award,
  MessageCircle,
  Handshake,
  Rocket,
  CheckCircle
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Tentang Komunitas - DiskusiBisnis',
  description: 'Visi, misi, target anggota, dan manfaat bergabung dengan komunitas DiskusiBisnis - Platform UMKM Indonesia'
};

export default function AboutCommunityPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
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
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 p-8 text-white">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-bold mb-3">Tentang Komunitas DiskusiBisnis</h1>
              <p className="text-lg opacity-95 leading-relaxed">
                Komunitas Pengusaha UMKM Indonesia yang Tumbuh Bersama Melalui Berbagi Pengetahuan & Networking
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 lg:p-12 space-y-12">
            
            {/* Vision Section */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <Eye size={28} className="text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Visi Kami</h2>
              </div>
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-xl border border-emerald-200">
                <p className="text-lg text-slate-800 leading-relaxed font-medium">
                  Menjadi <strong className="text-emerald-700">platform komunitas UMKM #1 di Indonesia</strong> yang menghubungkan 
                  jutaan pengusaha dengan pengetahuan, mentor, partner bisnis, dan peluang investasi untuk 
                  <strong className="text-emerald-700"> mengakselerasi pertumbuhan bisnis</strong> secara berkelanjutan.
                </p>
              </div>
            </section>

            {/* Mission Section */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <Target size={28} className="text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Misi Kami</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-200">
                  <div className="flex items-start gap-3">
                    <CheckCircle size={24} className="text-emerald-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg text-slate-900 mb-2">Demokratisasi Pengetahuan</h3>
                      <p className="text-slate-700">
                        Membuat pengetahuan bisnis berkualitas dapat diakses oleh semua pengusaha UMKM, 
                        tanpa batasan geografis atau finansial.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-200">
                  <div className="flex items-start gap-3">
                    <CheckCircle size={24} className="text-emerald-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg text-slate-900 mb-2">Bangun Ekosistem Kolaboratif</h3>
                      <p className="text-slate-700">
                        Menciptakan lingkungan dimana pengusaha saling membantu, berbagi pengalaman, 
                        dan tumbuh bersama melalui kolaborasi.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-200">
                  <div className="flex items-start gap-3">
                    <CheckCircle size={24} className="text-emerald-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg text-slate-900 mb-2">Koneksi dengan Peluang</h3>
                      <p className="text-slate-700">
                        Menghubungkan UMKM dengan partner bisnis, supplier, investor, dan mentor 
                        yang tepat untuk scale-up.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-200">
                  <div className="flex items-start gap-3">
                    <CheckCircle size={24} className="text-emerald-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg text-slate-900 mb-2">Pemberdayaan Berkelanjutan</h3>
                      <p className="text-slate-700">
                        Memberikan tools, resources, dan support system yang dibutuhkan UMKM 
                        untuk terus berkembang jangka panjang.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Target Members Section */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <Users size={28} className="text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Siapa Target Anggota Kami?</h2>
              </div>
              
              <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-200 mb-6">
                <p className="text-lg text-slate-800 leading-relaxed">
                  DiskusiBisnis dirancang untuk <strong>semua pengusaha UMKM di Indonesia</strong>, dari berbagai 
                  tahap perjalanan bisnis. Komunitas kami terbuka dan inklusif untuk:
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-6 bg-white rounded-xl border-2 border-slate-200 hover:border-emerald-300 transition-colors">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center mb-4">
                    <Lightbulb size={24} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Calon Pengusaha</h3>
                  <ul className="space-y-2 text-slate-700">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 mt-1">•</span>
                      <span>Ingin memulai bisnis tapi bingung mulai dari mana</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-1">•</span>
                      <span>Punya ide bisnis tapi butuh validasi</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-1">•</span>
                      <span>Mencari inspirasi dan role model</span>
                    </li>
                  </ul>
                </div>

                <div className="p-6 bg-white rounded-xl border-2 border-slate-200 hover:border-emerald-300 transition-colors">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-green-600 rounded-lg flex items-center justify-center mb-4">
                    <Rocket size={24} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Pengusaha Pemula</h3>
                  <ul className="space-y-2 text-slate-700">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 mt-1">•</span>
                      <span>Bisnis berjalan 0-3 tahun</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 mt-1">•</span>
                      <span>Masih belajar operasional & strategi</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 mt-1">•</span>
                      <span>Ingin scale-up dan grow sustainably</span>
                    </li>
                  </ul>
                </div>

                <div className="p-6 bg-white rounded-xl border-2 border-slate-200 hover:border-emerald-300 transition-colors">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-700 to-teal-700 rounded-lg flex items-center justify-center mb-4">
                    <Award size={24} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Pengusaha Berpengalaman</h3>
                  <ul className="space-y-2 text-slate-700">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 mt-1">•</span>
                      <span>Bisnis established & profitable</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Ingin berbagi pengalaman & mentoring</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Mencari kolaborasi & ekspansi bisnis</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Benefits Section */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <TrendingUp size={28} className="text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Manfaat Bergabung di Komunitas</h2>
              </div>

              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-xl border border-emerald-200 mb-8">
                <p className="text-lg text-slate-800 leading-relaxed">
                  <strong className="text-emerald-700">Di sini kamu bisa networking, belajar strategi, dapat partner, 
                  investor, dan mentorship</strong> — semua yang kamu butuhkan untuk mengembangkan bisnis 
                  ada di satu platform!
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Benefit 1: Networking */}
                <div className="p-6 bg-white rounded-xl border-2 border-slate-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-emerald-100 rounded-lg">
                      <Users size={24} className="text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Networking Berkualitas</h3>
                  </div>
                  <p className="text-slate-700 mb-4 leading-relaxed">
                    Bangun relasi dengan ribuan pengusaha UMKM dari berbagai industri di seluruh Indonesia.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-slate-700">
                      <CheckCircle size={18} className="text-emerald-600 flex-shrink-0 mt-1" />
                      <span>Koneksi dengan pengusaha dari berbagai industri</span>
                    </li>
                    <li className="flex items-start gap-2 text-slate-700">
                      <CheckCircle size={18} className="text-blue-600 flex-shrink-0 mt-1" />
                      <span>Komunitas aktif yang responsif & supportive</span>
                    </li>
                    <li className="flex items-start gap-2 text-slate-700">
                      <CheckCircle size={18} className="text-blue-600 flex-shrink-0 mt-1" />
                      <span>Event & meetup reguler (online & offline)</span>
                    </li>
                    <li className="flex items-start gap-2 text-slate-700">
                      <CheckCircle size={18} className="text-blue-600 flex-shrink-0 mt-1" />
                      <span>Private messaging untuk diskusi lebih dalam</span>
                    </li>
                  </ul>
                </div>

                {/* Benefit 2: Belajar Strategi */}
                <div className="p-6 bg-white rounded-xl border-2 border-slate-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-emerald-100 rounded-lg">
                      <Lightbulb size={24} className="text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Belajar Strategi Bisnis</h3>
                  </div>
                  <p className="text-slate-700 mb-4 leading-relaxed">
                    Akses pengetahuan dan strategi bisnis dari praktisi berpengalaman secara gratis.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-slate-700">
                      <CheckCircle size={18} className="text-emerald-600 flex-shrink-0 mt-1" />
                      <span>Jawaban dari expert yang terverifikasi</span>
                    </li>
                    <li className="flex items-start gap-2 text-slate-700">
                      <CheckCircle size={18} className="text-purple-600 flex-shrink-0 mt-1" />
                      <span>Case study & best practices dari bisnis nyata</span>
                    </li>
                    <li className="flex items-start gap-2 text-slate-700">
                      <CheckCircle size={18} className="text-purple-600 flex-shrink-0 mt-1" />
                      <span>Tips marketing, sales, operasional, & keuangan</span>
                    </li>
                    <li className="flex items-start gap-2 text-slate-700">
                      <CheckCircle size={18} className="text-purple-600 flex-shrink-0 mt-1" />
                      <span>Library lengkap dengan ribuan Q&A terdokumentasi</span>
                    </li>
                  </ul>
                </div>

                {/* Benefit 3: Partner Bisnis */}
                <div className="p-6 bg-white rounded-xl border-2 border-slate-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-emerald-100 rounded-lg">
                      <Handshake size={24} className="text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Dapat Partner Bisnis</h3>
                  </div>
                  <p className="text-slate-700 mb-4 leading-relaxed">
                    Temukan partner, supplier, distributor, dan kolaborator yang tepat untuk bisnismu.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-slate-700">
                      <CheckCircle size={18} className="text-emerald-600 flex-shrink-0 mt-1" />
                      <span>Co-founder untuk scaling bisnis</span>
                    </li>
                    <li className="flex items-start gap-2 text-slate-700">
                      <CheckCircle size={18} className="text-emerald-600 flex-shrink-0 mt-1" />
                      <span>Supplier & vendor terpercaya</span>
                    </li>
                    <li className="flex items-start gap-2 text-slate-700">
                      <CheckCircle size={18} className="text-emerald-600 flex-shrink-0 mt-1" />
                      <span>Peluang kolaborasi lintas industri</span>
                    </li>
                    <li className="flex items-start gap-2 text-slate-700">
                      <CheckCircle size={18} className="text-emerald-600 flex-shrink-0 mt-1" />
                      <span>Joint venture & ekspansi pasar bersama</span>
                    </li>
                  </ul>
                </div>

                {/* Benefit 4: Investor & Mentorship */}
                <div className="p-6 bg-white rounded-xl border-2 border-slate-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-emerald-100 rounded-lg">
                      <DollarSign size={24} className="text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Investor & Mentorship</h3>
                  </div>
                  <p className="text-slate-700 mb-4 leading-relaxed">
                    Akses ke investor dan mentor yang siap membantu scale-up bisnismu.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-slate-700">
                      <CheckCircle size={18} className="text-emerald-600 flex-shrink-0 mt-1" />
                      <span>Koneksi dengan angel investors & VC</span>
                    </li>
                    <li className="flex items-start gap-2 text-slate-700">
                      <CheckCircle size={18} className="text-amber-600 flex-shrink-0 mt-1" />
                      <span>Mentorship 1-on-1 dari senior entrepreneurs</span>
                    </li>
                    <li className="flex items-start gap-2 text-slate-700">
                      <CheckCircle size={18} className="text-amber-600 flex-shrink-0 mt-1" />
                      <span>Pitch deck review & feedback dari experts</span>
                    </li>
                    <li className="flex items-start gap-2 text-slate-700">
                      <CheckCircle size={18} className="text-amber-600 flex-shrink-0 mt-1" />
                      <span>Workshop & coaching untuk fundraising</span>
                    </li>
                  </ul>
                </div>

                {/* Benefit 5: Dukungan Bisnis 24/7 */}
                <div className="p-6 bg-white rounded-xl border-2 border-slate-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-emerald-100 rounded-lg">
                      <MessageCircle size={24} className="text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Dukungan Bisnis 24/7</h3>
                  </div>
                  <p className="text-slate-700 mb-4 leading-relaxed">
                    Dapatkan jawaban cepat untuk setiap tantangan bisnis yang kamu hadapi.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-slate-700">
                      <CheckCircle size={18} className="text-emerald-600 flex-shrink-0 mt-1" />
                      <span>Tanya kapan saja, komunitas selalu responsif</span>
                    </li>
                    <li className="flex items-start gap-2 text-slate-700">
                      <CheckCircle size={18} className="text-rose-600 flex-shrink-0 mt-1" />
                      <span>Berbagai perspektif dari multiple backgrounds</span>
                    </li>
                    <li className="flex items-start gap-2 text-slate-700">
                      <CheckCircle size={18} className="text-rose-600 flex-shrink-0 mt-1" />
                      <span>Solusi praktis berdasarkan pengalaman nyata</span>
                    </li>
                    <li className="flex items-start gap-2 text-slate-700">
                      <CheckCircle size={18} className="text-rose-600 flex-shrink-0 mt-1" />
                      <span>Komunitas yang empathetic & supportive</span>
                    </li>
                  </ul>
                </div>

                {/* Benefit 6: Gratis & Accessible */}
                <div className="p-6 bg-white rounded-xl border-2 border-slate-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-emerald-100 rounded-lg">
                      <Heart size={24} className="text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Gratis Selamanya</h3>
                  </div>
                  <p className="text-slate-700 mb-4 leading-relaxed">
                    Akses semua fitur dan benefit tanpa biaya berlangganan atau hidden fee.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-slate-700">
                      <CheckCircle size={18} className="text-emerald-600 flex-shrink-0 mt-1" />
                      <span>100% gratis, tidak ada premium tier</span>
                    </li>
                    <li className="flex items-start gap-2 text-slate-700">
                      <CheckCircle size={18} className="text-teal-600 flex-shrink-0 mt-1" />
                      <span>Akses unlimited questions & answers</span>
                    </li>
                    <li className="flex items-start gap-2 text-slate-700">
                      <CheckCircle size={18} className="text-teal-600 flex-shrink-0 mt-1" />
                      <span>Tidak ada batasan fitur atau engagement</span>
                    </li>
                    <li className="flex items-start gap-2 text-slate-700">
                      <CheckCircle size={18} className="text-teal-600 flex-shrink-0 mt-1" />
                      <span>Platform inklusif untuk semua kalangan</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Value Proposition */}
            <section className="bg-gradient-to-br from-emerald-600 to-emerald-500 p-8 rounded-xl text-white">
              <h2 className="text-2xl font-bold mb-4 text-center">Kenapa Harus Join DiskusiBisnis?</h2>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Briefcase size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Solusi Praktis untuk Masalah Nyata</h3>
                    <p className="text-white/90">
                      Dapatkan jawaban konkret dari pengusaha yang sudah mengalami dan mengatasi 
                      tantangan yang sama dengan bisnismu.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Komunitas yang Genuine & Supportive</h3>
                    <p className="text-white/90">
                      Bukan sekedar forum biasa - ini adalah komunitas pengusaha yang saling peduli 
                      dan siap membantu kesuksesan satu sama lain.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Rocket size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Akselerasi Pertumbuhan Bisnis</h3>
                    <p className="text-white/90">
                      Belajar dari kesalahan orang lain, adopsi strategi yang terbukti berhasil, 
                      dan hindari trial & error yang mahal.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Scale-Up dengan Lebih Cepat</h3>
                    <p className="text-white/90">
                      Dengan akses ke mentors, investors, dan partners yang tepat, percepat 
                      perjalanan scale-up bisnismu.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-xl font-semibold">
                  Bergabunglah dengan 10,000+ pengusaha UMKM yang sudah grow together! 🚀
                </p>
              </div>
            </section>

            {/* CTA Section */}
            <section className="text-center py-6 bg-slate-50 rounded-xl">
              <h2 className="text-2xl font-bold text-slate-900 mb-3">
                Siap Bergabung dengan Komunitas?
              </h2>
              <p className="text-lg text-slate-600 mb-6 max-w-2xl mx-auto">
                Mulai bertanya, berbagi pengetahuan, dan kembangkan bisnismu bersama 
                ribuan pengusaha UMKM lainnya. <strong>100% Gratis!</strong>
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/register"
                  className="px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold"
                >
                  Daftar Sekarang - Gratis
                </Link>
                <Link
                  href="/communities"
                  className="px-8 py-3 border-2 border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors font-semibold"
                >
                  Jelajahi Komunitas
                </Link>
              </div>
              
              <p className="text-sm text-slate-500 mt-6">
                Tidak perlu kartu kredit • Tidak ada biaya tersembunyi • Join dalam 30 detik
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
