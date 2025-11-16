import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  ArrowLeft, 
  HelpCircle, 
  MessageCircle, 
  Mail, 
  BookOpen,
  Search,
  UserPlus,
  MessageSquare,
  Award,
  Settings,
  Shield,
  AlertCircle,
  ChevronRight
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Bantuan - DiskusiBisnis',
  description: 'Panduan lengkap dan bantuan penggunaan platform DiskusiBisnis'
};

export default function HelpPage() {
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
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 p-6 text-white">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <HelpCircle size={28} />
              </div>
              <h1 className="text-3xl font-bold">Pusat Bantuan</h1>
            </div>
            <p className="text-lg opacity-90">
              Panduan lengkap untuk memaksimalkan pengalaman Anda di DiskusiBisnis
            </p>
          </div>

          {/* Content */}
          <div className="p-8 space-y-8">
            
            {/* Quick Links */}
            <section className="grid md:grid-cols-3 gap-4">
              <Link 
                href="#getting-started"
                className="p-6 bg-emerald-50 rounded-xl border border-emerald-200 hover:border-emerald-400 transition-colors group"
              >
                <UserPlus size={32} className="text-emerald-600 mb-3" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Memulai</h3>
                <p className="text-sm text-slate-600">Cara mendaftar dan menggunakan platform</p>
                <ChevronRight size={20} className="text-emerald-600 mt-2 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link 
                href="#asking-questions"
                className="p-6 bg-emerald-50 rounded-xl border border-emerald-200 hover:border-emerald-400 transition-colors group"
              >
                <MessageSquare size={32} className="text-emerald-600 mb-3" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Bertanya</h3>
                <p className="text-sm text-slate-600">Tips membuat pertanyaan yang baik</p>
                <ChevronRight size={20} className="text-emerald-600 mt-2 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link 
                href="#community-guidelines"
                className="p-6 bg-slate-50 rounded-xl border border-slate-200 hover:border-emerald-400 transition-colors group"
              >
                <Shield size={32} className="text-slate-600 mb-3" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Panduan</h3>
                <p className="text-sm text-slate-600">Aturan dan etika komunitas</p>
                <ChevronRight size={20} className="text-slate-600 mt-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </section>

            {/* Getting Started */}
            <section id="getting-started" className="scroll-mt-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <UserPlus size={24} className="text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Memulai di DiskusiBisnis</h2>
              </div>

              <div className="space-y-4">
                <details className="group bg-slate-50 rounded-xl border border-slate-200 p-6">
                  <summary className="font-semibold text-lg text-slate-900 cursor-pointer flex items-center justify-between">
                    Bagaimana cara mendaftar?
                    <ChevronRight size={20} className="group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="mt-4 text-slate-700 space-y-2">
                    <p>1. Klik tombol "Daftar" di pojok kanan atas</p>
                    <p>2. Isi form pendaftaran dengan nama lengkap, email, dan password</p>
                    <p>3. Verifikasi email Anda melalui link yang dikirimkan</p>
                    <p>4. Lengkapi profil Anda (opsional tapi disarankan)</p>
                    <p>5. Mulai bertanya atau menjawab pertanyaan!</p>
                  </div>
                </details>

                <details className="group bg-slate-50 rounded-xl border border-slate-200 p-6">
                  <summary className="font-semibold text-lg text-slate-900 cursor-pointer flex items-center justify-between">
                    Apakah DiskusiBisnis gratis?
                    <ChevronRight size={20} className="group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="mt-4 text-slate-700">
                    <p>
                      Ya, 100% gratis! Semua fitur di DiskusiBisnis dapat diakses tanpa biaya berlangganan. 
                      Tidak ada premium tier atau hidden fee. Kami percaya bahwa akses ke pengetahuan bisnis 
                      harus tersedia untuk semua pengusaha UMKM.
                    </p>
                  </div>
                </details>

                <details className="group bg-slate-50 rounded-xl border border-slate-200 p-6">
                  <summary className="font-semibold text-lg text-slate-900 cursor-pointer flex items-center justify-between">
                    Apa yang bisa saya lakukan di platform ini?
                    <ChevronRight size={20} className="group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="mt-4 text-slate-700">
                    <ul className="space-y-2 list-disc list-inside">
                      <li>Bertanya tentang bisnis dan mendapat jawaban dari komunitas</li>
                      <li>Menjawab pertanyaan dan berbagi pengalaman Anda</li>
                      <li>Bergabung dengan komunitas bisnis yang relevan</li>
                      <li>Networking dengan pengusaha lain</li>
                      <li>Mendapatkan reputation points untuk kontribusi Anda</li>
                      <li>Menyimpan pertanyaan favorit untuk referensi</li>
                      <li>Mengikuti topik dan tag yang Anda minati</li>
                    </ul>
                  </div>
                </details>
              </div>
            </section>

            {/* Asking Questions */}
            <section id="asking-questions" className="scroll-mt-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <MessageSquare size={24} className="text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Bertanya dengan Efektif</h2>
              </div>

              <div className="space-y-4">
                <details className="group bg-slate-50 rounded-xl border border-slate-200 p-6">
                  <summary className="font-semibold text-lg text-slate-900 cursor-pointer flex items-center justify-between">
                    Bagaimana cara membuat pertanyaan yang baik?
                    <ChevronRight size={20} className="group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="mt-4 text-slate-700 space-y-3">
                    <p className="font-semibold">Tips membuat pertanyaan berkualitas:</p>
                    <ul className="space-y-2 list-disc list-inside">
                      <li><strong>Judul yang jelas dan spesifik</strong> - Rangkum masalah Anda dalam 1 kalimat</li>
                      <li><strong>Berikan konteks</strong> - Jelaskan situasi bisnis Anda secara detail</li>
                      <li><strong>Spesifik</strong> - Hindari pertanyaan yang terlalu luas atau umum</li>
                      <li><strong>Satu pertanyaan per post</strong> - Jangan gabungkan banyak pertanyaan</li>
                      <li><strong>Gunakan tag yang relevan</strong> - Membantu orang yang tepat menemukan pertanyaan Anda</li>
                      <li><strong>Format dengan baik</strong> - Gunakan paragraf, bullets, atau numbering</li>
                      <li><strong>Sertakan gambar jika perlu</strong> - Visual membantu pemahaman</li>
                    </ul>
                  </div>
                </details>

                <details className="group bg-slate-50 rounded-xl border border-slate-200 p-6">
                  <summary className="font-semibold text-lg text-slate-900 cursor-pointer flex items-center justify-between">
                    Topik apa saja yang bisa ditanyakan?
                    <ChevronRight size={20} className="group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="mt-4 text-slate-700">
                    <p className="mb-3">Anda bisa bertanya tentang berbagai aspek bisnis UMKM:</p>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="p-3 bg-white rounded-lg border border-slate-200">
                        <strong>Marketing & Sales:</strong> Digital marketing, strategi penjualan, branding
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-slate-200">
                        <strong>Operasional:</strong> Supply chain, inventory, SOP, quality control
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-slate-200">
                        <strong>Keuangan:</strong> Pembukuan, cash flow, pricing, pajak
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-slate-200">
                        <strong>Legal:</strong> Perizinan, kontrak, legalitas usaha
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-slate-200">
                        <strong>SDM:</strong> Hiring, training, company culture
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-slate-200">
                        <strong>Teknologi:</strong> Tools bisnis, automation, e-commerce
                      </div>
                    </div>
                  </div>
                </details>

                <details className="group bg-slate-50 rounded-xl border border-slate-200 p-6">
                  <summary className="font-semibold text-lg text-slate-900 cursor-pointer flex items-center justify-between">
                    Bagaimana cara mendapat jawaban cepat?
                    <ChevronRight size={20} className="group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="mt-4 text-slate-700">
                    <ul className="space-y-2 list-disc list-inside">
                      <li>Buat pertanyaan yang jelas dan mudah dipahami</li>
                      <li>Gunakan tag yang tepat agar ditemukan expert di bidang tersebut</li>
                      <li>Post di waktu yang tepat (jam kerja biasanya lebih aktif)</li>
                      <li>Pilih komunitas yang relevan</li>
                      <li>Gunakan judul yang menarik perhatian</li>
                      <li>Respond cepat jika ada yang bertanya untuk klarifikasi</li>
                    </ul>
                  </div>
                </details>
              </div>
            </section>

            {/* Answering & Reputation */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Award size={24} className="text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Menjawab & Reputation System</h2>
              </div>

              <div className="space-y-4">
                <details className="group bg-slate-50 rounded-xl border border-slate-200 p-6">
                  <summary className="font-semibold text-lg text-slate-900 cursor-pointer flex items-center justify-between">
                    Bagaimana cara mendapat reputation points?
                    <ChevronRight size={20} className="group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="mt-4 text-slate-700">
                    <p className="mb-3">Anda mendapat reputation points dari:</p>
                    <ul className="space-y-2">
                      <li>✓ Pertanyaan Anda mendapat upvote: +5 points</li>
                      <li>✓ Jawaban Anda mendapat upvote: +10 points</li>
                      <li>✓ Jawaban Anda diterima sebagai solusi terbaik: +15 points</li>
                      <li>✓ Verifikasi sebagai expert: +100 points</li>
                      <li className="text-red-600">✗ Pertanyaan/Jawaban mendapat downvote: -2 points</li>
                    </ul>
                  </div>
                </details>

                <details className="group bg-slate-50 rounded-xl border border-slate-200 p-6">
                  <summary className="font-semibold text-lg text-slate-900 cursor-pointer flex items-center justify-between">
                    Apa manfaat reputation tinggi?
                    <ChevronRight size={20} className="group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="mt-4 text-slate-700">
                    <ul className="space-y-2 list-disc list-inside">
                      <li>Badge dan recognition di komunitas</li>
                      <li>Jawaban Anda ditampilkan lebih prominent</li>
                      <li>Akses ke fitur moderasi komunitas (untuk high reputation users)</li>
                      <li>Peluang menjadi expert verified</li>
                      <li>Kredibilitas lebih tinggi di mata komunitas</li>
                    </ul>
                  </div>
                </details>

                <details className="group bg-slate-50 rounded-xl border border-slate-200 p-6">
                  <summary className="font-semibold text-lg text-slate-900 cursor-pointer flex items-center justify-between">
                    Tips memberikan jawaban berkualitas?
                    <ChevronRight size={20} className="group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="mt-4 text-slate-700">
                    <ul className="space-y-2 list-disc list-inside">
                      <li>Berikan jawaban yang lengkap dan detail</li>
                      <li>Sertakan contoh nyata atau case study jika memungkinkan</li>
                      <li>Jelaskan "mengapa" bukan hanya "apa"</li>
                      <li>Gunakan format yang mudah dibaca (bullets, paragraf pendek)</li>
                      <li>Sertakan sumber atau referensi jika ada</li>
                      <li>Bersikap sopan dan respectful</li>
                      <li>Edit dan improve jawaban Anda jika ada informasi tambahan</li>
                    </ul>
                  </div>
                </details>
              </div>
            </section>

            {/* Community Guidelines */}
            <section id="community-guidelines" className="scroll-mt-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <Shield size={24} className="text-slate-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Panduan Komunitas</h2>
              </div>

              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-6">
                <p className="text-slate-800 leading-relaxed">
                  Kami membangun komunitas yang <strong>respectful, helpful, dan professional</strong>. 
                  Setiap anggota diharapkan berkontribusi positif dan menjaga lingkungan yang kondusif 
                  untuk belajar dan berkembang bersama.
                </p>
              </div>

              <div className="space-y-4">
                <details className="group bg-slate-50 rounded-xl border border-slate-200 p-6">
                  <summary className="font-semibold text-lg text-slate-900 cursor-pointer flex items-center justify-between">
                    Do's - Yang Dianjurkan
                    <ChevronRight size={20} className="group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="mt-4 text-slate-700">
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-600">✓</span>
                        <span>Bersikap sopan dan respectful kepada semua anggota</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-600">✓</span>
                        <span>Berbagi pengetahuan dan pengalaman dengan generous</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-600">✓</span>
                        <span>Memberikan jawaban yang faktual dan berdasarkan pengalaman</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-600">✓</span>
                        <span>Konstruktif dalam memberikan kritik atau feedback</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-600">✓</span>
                        <span>Apresiasi kontribusi orang lain dengan upvote atau komentar positif</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-600">✓</span>
                        <span>Search terlebih dahulu sebelum bertanya hal yang umum</span>
                      </li>
                    </ul>
                  </div>
                </details>

                <details className="group bg-slate-50 rounded-xl border border-slate-200 p-6">
                  <summary className="font-semibold text-lg text-slate-900 cursor-pointer flex items-center justify-between">
                    Don'ts - Yang Dilarang
                    <ChevronRight size={20} className="group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="mt-4 text-slate-700">
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-red-600">✗</span>
                        <span>Spam, promosi berlebihan, atau self-promotion tanpa nilai tambah</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-600">✗</span>
                        <span>Harassment, hate speech, atau diskriminasi dalam bentuk apapun</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-600">✗</span>
                        <span>Konten SARA, pornografi, atau hal-hal ilegal</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-600">✗</span>
                        <span>Plagiarisme atau mengklaim karya orang lain</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-600">✗</span>
                        <span>Menyebarkan informasi palsu atau menyesatkan</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-600">✗</span>
                        <span>Meminta atau menawarkan jasa ilegal</span>
                      </li>
                    </ul>
                  </div>
                </details>

                <div className="bg-red-50 p-6 rounded-xl border border-red-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle size={24} className="text-red-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg text-slate-900 mb-2">Pelanggaran dan Konsekuensi</h3>
                      <p className="text-slate-700 mb-3">
                        Pelanggaran terhadap panduan komunitas akan dikenakan sanksi:
                      </p>
                      <ul className="space-y-1 text-slate-700">
                        <li>• Peringatan pertama: Warning dari moderator</li>
                        <li>• Pelanggaran kedua: Suspend akun 7 hari</li>
                        <li>• Pelanggaran berat/berulang: Permanent ban</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Account & Settings */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <Settings size={24} className="text-slate-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Akun & Pengaturan</h2>
              </div>

              <div className="space-y-4">
                <details className="group bg-slate-50 rounded-xl border border-slate-200 p-6">
                  <summary className="font-semibold text-lg text-slate-900 cursor-pointer flex items-center justify-between">
                    Bagaimana cara mengubah profil saya?
                    <ChevronRight size={20} className="group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="mt-4 text-slate-700">
                    <p>1. Klik foto profil Anda di pojok kanan atas</p>
                    <p>2. Pilih "Settings" dari dropdown menu</p>
                    <p>3. Edit informasi yang ingin diubah (nama, bio, foto, dll)</p>
                    <p>4. Klik "Simpan Perubahan"</p>
                  </div>
                </details>

                <details className="group bg-slate-50 rounded-xl border border-slate-200 p-6">
                  <summary className="font-semibold text-lg text-slate-900 cursor-pointer flex items-center justify-between">
                    Bagaimana cara reset password?
                    <ChevronRight size={20} className="group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="mt-4 text-slate-700">
                    <p>1. Klik "Lupa Password?" di halaman login</p>
                    <p>2. Masukkan email yang terdaftar</p>
                    <p>3. Cek inbox email Anda untuk link reset password</p>
                    <p>4. Klik link tersebut dan buat password baru</p>
                    <p className="mt-3 text-amber-700">
                      <strong>Tips:</strong> Gunakan password yang kuat dengan kombinasi huruf, angka, dan simbol.
                    </p>
                  </div>
                </details>

                <details className="group bg-slate-50 rounded-xl border border-slate-200 p-6">
                  <summary className="font-semibold text-lg text-slate-900 cursor-pointer flex items-center justify-between">
                    Bagaimana cara menghapus akun?
                    <ChevronRight size={20} className="group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="mt-4 text-slate-700">
                    <p className="mb-3">
                      Untuk menghapus akun, silakan hubungi tim support kami di{' '}
                      <a href="mailto:support@diskusibisnis.com" className="text-blue-600 hover:underline">
                        support@diskusibisnis.com
                      </a>
                    </p>
                    <p className="text-red-600">
                      <strong>Perhatian:</strong> Penghapusan akun bersifat permanen dan tidak dapat dibatalkan. 
                      Semua pertanyaan, jawaban, dan data Anda akan dihapus.
                    </p>
                  </div>
                </details>
              </div>
            </section>

            {/* Contact Support */}
            <section className="bg-gradient-to-r from-emerald-600 to-emerald-500 p-6 rounded-xl text-white">
              <div className="text-center">
                <MessageCircle size={40} className="mx-auto mb-3" />
                <h2 className="text-2xl font-bold mb-3">Masih Ada Pertanyaan?</h2>
                <p className="text-lg mb-4 opacity-90">
                  Tim kami siap membantu Anda! Hubungi kami melalui:
                </p>
                <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  <a 
                    href="mailto:support@diskusibisnis.com"
                    className="flex items-center justify-center gap-3 bg-white/20 hover:bg-white/30 transition-colors p-4 rounded-lg"
                  >
                    <Mail size={24} />
                    <span>support@diskusibisnis.com</span>
                  </a>
                  <Link 
                    href="/communities"
                    className="flex items-center justify-center gap-3 bg-white/20 hover:bg-white/30 transition-colors p-4 rounded-lg"
                  >
                    <MessageCircle size={24} />
                    <span>Tanya di Komunitas</span>
                  </Link>
                </div>
                <p className="text-sm mt-4 opacity-75">
                  Response time: 1-2 hari kerja
                </p>
              </div>
            </section>

            {/* Additional Resources */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">Resource Tambahan</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link 
                  href="/about"
                  className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-emerald-400 transition-colors"
                >
                  <BookOpen size={20} className="text-emerald-600 mb-2" />
                  <h3 className="font-semibold text-slate-900 mb-1">Tentang Platform</h3>
                  <p className="text-sm text-slate-600">Pelajari lebih lanjut tentang DiskusiBisnis</p>
                </Link>

                <Link 
                  href="/terms"
                  className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-emerald-400 transition-colors"
                >
                  <Shield size={24} className="text-blue-600 mb-2" />
                  <h3 className="font-semibold text-slate-900 mb-1">Syarat & Ketentuan</h3>
                  <p className="text-sm text-slate-600">Ketentuan penggunaan platform</p>
                </Link>

                <Link 
                  href="/privacy"
                  className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-emerald-400 transition-colors"
                >
                  <Shield size={24} className="text-purple-600 mb-2" />
                  <h3 className="font-semibold text-slate-900 mb-1">Kebijakan Privasi</h3>
                  <p className="text-sm text-slate-600">Bagaimana kami melindungi data Anda</p>
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
