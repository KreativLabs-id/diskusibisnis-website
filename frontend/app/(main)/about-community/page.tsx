import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Users, Shield, Heart, MessagesSquare } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Tentang Komunitas',
  description: 'Budaya dan nilai-nilai komunitas DiskusiBisnis.'
};

export default function AboutCommunityPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-12 md:py-20">

        {/* Navigation */}
        <nav className="mb-12">
          <Link
            href="/explore"
            className="group inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Kembali
          </Link>
        </nav>

        {/* Header */}
        <header className="mb-16 md:mb-24">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 mb-6 leading-tight">
            Kita tumbuh karena <span className="text-emerald-600">kita peduli</span>.
          </h1>
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl">
            DiskusiBisnis bukan sekadar website, melainkan kumpulan individu yang percaya bahwa sukses bisnis adalah hasil dari kolaborasi, bukan isolasi.
          </p>
        </header>

        <div className="space-y-20 md:space-y-32">

          {/* Core Values */}
          <section>
            <div className="flex items-center gap-3 mb-12">
              <span className="w-8 h-[2px] bg-emerald-600"></span>
              <span className="text-sm font-bold text-emerald-600 uppercase tracking-wider">Nilai Komunitas</span>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-emerald-600 mb-6 border border-slate-100">
                  <Heart className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Saling Memberi</h3>
                <p className="text-slate-600 leading-relaxed">
                  Budaya kami dibangun di atas prinsip "Givers Gain". Semakin banyak Anda membantu orang lain dengan jawaban berkualitas, semakin banyak reputasi dan peluang yang akan Anda dapatkan.
                </p>
              </div>

              <div>
                <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-emerald-600 mb-6 border border-slate-100">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Kejujuran & Transparansi</h3>
                <p className="text-slate-600 leading-relaxed">
                  Kami menghargai diskusi yang jujur. Share pengalaman nyata—baik kesuksesan maupun kegagalan. Karena pelajaran terbaik seringkali datang dari kegagalan.
                </p>
              </div>

              <div>
                <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-emerald-600 mb-6 border border-slate-100">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Inklusivitas</h3>
                <p className="text-slate-600 leading-relaxed">
                  Baik Anda pemilik warung kecil atau CEO startup dengan funding jutaan dolar, suara Anda dihargai di sini. Kami tidak memandang skala bisnis, tapi kualitas ide.
                </p>
              </div>

              <div>
                <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-emerald-600 mb-6 border border-slate-100">
                  <MessagesSquare className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Fokus Solusi</h3>
                <p className="text-slate-600 leading-relaxed">
                  Hindari debat kusir. Fokus kami adalah bagaimana memecahkan masalah. Jika mengkritik, berikan solusi alternatif yang membangun.
                </p>
              </div>
            </div>
          </section>

          {/* Guidelines Mini */}
          <section className="bg-slate-900 rounded-3xl p-8 md:p-16 text-white text-center md:text-left overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-xl">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Ingin Menjadi Member Teladan?</h2>
                <p className="text-slate-300 leading-relaxed mb-8">
                  Pelajari panduan lengkap etika komunitas kami untuk memastikan interaksi yang positif dan produktif.
                </p>
                <Link
                  href="/terms"
                  className="inline-flex px-6 py-3 bg-emerald-600 text-white font-medium rounded-full hover:bg-emerald-500 transition-colors"
                >
                  Baca Panduan Etika
                </Link>
              </div>

              <div className="shrink-0 p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                <div className="text-4xl font-bold text-emerald-400 mb-2">#1</div>
                <div className="text-white font-medium">Aturan Emas</div>
                <div className="text-sm text-slate-400 mt-1">"Bicaralah pada orang lain<br />seperti Anda ingin diajak bicara."</div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
