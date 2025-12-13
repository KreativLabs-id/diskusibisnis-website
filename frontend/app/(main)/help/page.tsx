import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, MessageCircleQuestion, Mail, MessageSquare } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Pusat Bantuan',
  description: 'Bantuan dan dukungan untuk pengguna DiskusiBisnis.'
};

export default function HelpPage() {
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
        <header className="mb-16">
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">Pusat Bantuan</h1>
          <p className="text-xl text-slate-600 leading-relaxed max-w-2xl">
            Temukan jawaban atas pertanyaan Anda atau hubungi tim dukungan kami jika Anda mengalami kendala.
          </p>
        </header>

        <div className="space-y-16">

          {/* FAQ Section */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-8">Pertanyaan Umum (FAQ)</h2>
            <div className="space-y-6">

              <div className="group">
                <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">Bagaimana cara menaikkan Reputasi?</h3>
                <p className="text-slate-600 leading-relaxed">
                  Reputasi didapatkan ketika pengguna lain memberikan upvote pada pertanyaan atau jawaban Anda. Jawaban yang diterima sebagai solusi juga memberikan poin reputasi yang besar.
                </p>
              </div>

              <div className="group">
                <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">Apakah platform ini gratis?</h3>
                <p className="text-slate-600 leading-relaxed">
                  Ya, DiskusiBisnis sepenuhnya gratis untuk digunakan oleh semua pelaku UMKM. Kami berkomitmen untuk mendemokratisasi pengetahuan bisnis.
                </p>
              </div>

              <div className="group">
                <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">Bagaimana cara melaporkan konten spam?</h3>
                <p className="text-slate-600 leading-relaxed">
                  Gunakan tombol "Laporkan" (ikon bendera) yang ada di setiap pertanyaan atau jawaban. Tim moderator kami akan meninjau laporan Anda dalam 24 jam.
                </p>
              </div>

            </div>
          </section>

          {/* Contact Section */}
          <section className="bg-emerald-50/50 rounded-3xl p-8 md:p-12 border border-emerald-100">
            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Butuh bantuan lebih lanjut?</h2>
                <p className="text-slate-600 mb-6 max-w-md">
                  Jika Anda tidak menemukan jawaban di atas, jangan ragu untuk menghubungi tim support kami secara langsung.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-slate-700">
                    <Mail className="w-5 h-5 text-emerald-600" />
                    <span className="font-medium">support@diskusibisnis.my.id</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700">
                    <MessageSquare className="w-5 h-5 text-emerald-600" />
                    <span>Live Chat (Setiap hari, 09:00 - 21:00)</span>
                  </div>
                </div>
              </div>

              <Link
                href="/contact" // Assuming there is a contact form page or mailto anchor
                className="px-8 py-4 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 whitespace-nowrap"
              >
                Hubungi Kami
              </Link>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
