# Hompage Redesign: StackOverflow-style Minimalist

## 1. Overview
Redesain total halaman utama (Homepage) DiskusiBisnis dari gaya landing page AI-generic menjadi utilitarian (berbasis fungsionalitas komunitas) menyerupai pola forum StackOverflow. Target utamanya adalah minimalis, fungsional penuh, dan berkesan premium tanpa komponen dekoratif seperti Hero Section yang tidak perlu.

## 2. Constraints & Principles
1. **Typografi Spesifik:** HANYA menggunakan family font `Inter`. Tidak ada font jenis serif atau font alternatif lain.
2. **Utilitarian Layout:** Informasi krusial (votings, answers, views) berada sejajar horizontal untuk kemudahan _scanning_ mata.
3. **No Hero Banner:** Segera masuk ke inti (umpan pertanyaan) untuk efisiensi pengguna.

## 3. Architecture & Components

### 3.1. Main Layout (`components/pages/HomePage.tsx`)
- Container: Lebar terbatas (`max-w-6xl` atau sejenis, disesuaikan) yang di-*center*.
- Perubahan Layout Grid: Layar besar menggunakan struktur 2 kolom—Kolom Utama (kiri) untuk daftar pertanyaan, Kanan untuk *Sidebar*.
- Bagian atas hanya berisi judul "Semua Pertanyaan", tombol ask, urutan filter, dan jumlah diskusi.

### 3.2. Sidebar (Komponen Pendukung)
- Memindahkan informasi status *"Live System"* ke sidebar kanan dengan footprint desain yang kecil namun premium.
- Menambahkan text sambutan pendek (pengganti hero section) ke sidebar dalam bentuk widget "About Community".

### 3.3. QuestionRow (`components/questions/QuestionCard.tsx`)
Struktur vertikal (`flex-col`) diganti menjadi baris horizontal (`flex-row` pada desktop).
- **Statistik Blok (Kiri):**
  - Jumlah suara/votes (warna gelap pekat).
  - Jumlah jawaban (outline border jika ada, background solid jika jawaban diterima `(has_accepted_answer = true)`).
  - Jumlah tayangan (warna abu-abu kalem).
- **Konten Blok (Kanan):** 
  - Judul (Inter, teks biru, no text-decoration tapi _hoverable_ warna lebih gelap).
  - Snippet isi pertanyaan (dipotong maksimal 2 baris).
  - Meta info sejajar: Deretan tag (hijau pudar) di kiri, Info Penulis + Tanggal (abu-abu kalem dengan _highlight_ untuk nama author) di sebelah kanan.

## 4. UI/UX Details

- **Responsive Behavior:** 
  - Mobile: Sidebar turun ke bagian paling bawah, statistik berpindah sejajar di bawah (atau menyempit).
- **Borders & Shadows:** 
  - Penghapusan total _card drop shadows_. 
  - Digantikan dengan pemisah baris sederhana `border-b border-gray-200` agar terasa premium, rapi, dan cepat dilirik.

## 5. Data Flow & Interactivity (Tidak Berubah)
- Menggunakan state internal dan API query yang sudah ada. Tab sorting (`newest`, `popular`, `unanswered`) tetap ada, visualnya saja yang didaur ulang menjadi _minimalist pills_.
- Polling refresh dan _cache_ di bagian halaman tidak berubah secara logika, hanya representasi visual skleton/pemuatan (loading) diubah agar cocok dengan desain baris pertanyaan baru.

## 6. Testing & Fallbacks
- Rencana pengujian memuat: Skeleton list baris (Row Skeleton) saat memuat.
- Empty state: Ditampilkan dalam blok minimalis sederhana tanpa _empty artwork_ raksasa; pesan _"Belum ada pertanyaan"_ dengan tombol _"Buat Pertanyaan"_.

---
**Status:** DRAFT (Menunggu Persetujuan)
