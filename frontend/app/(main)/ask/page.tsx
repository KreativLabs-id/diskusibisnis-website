'use client';

import { FormEvent, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { HelpCircle, Tag, Lightbulb, AlertCircle, ArrowLeft } from 'lucide-react';
import api, { questionAPI } from '@/lib/api';
import ImageUpload, { UploadedImage } from '@/components/ui/ImageUpload';
import MentionInput from '@/components/ui/MentionInput';

const suggestedTags = [
  'marketing',
  'keuangan',
  'legalitas',
  'operasional',
  'digital',
  'supply-chain',
  'sdm',
  'ekspansi',
];

export default function AskPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [communitySlug, setCommunitySlug] = useState('');
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    // Check if community is pre-selected from URL
    const community = searchParams.get('community');
    if (community) {
      setCommunitySlug(community);
    }
  }, [searchParams]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag],
    );
  };

  const addCustomTag = () => {
    const trimmedTag = customTag.trim().toLowerCase();

    if (!trimmedTag) {
      setError('Tag tidak boleh kosong');
      return;
    }

    if (trimmedTag.length < 2) {
      setError('Tag minimal 2 karakter');
      return;
    }

    if (trimmedTag.length > 20) {
      setError('Tag maksimal 20 karakter');
      return;
    }

    if (selectedTags.includes(trimmedTag)) {
      setError('Tag sudah ada dalam daftar');
      return;
    }

    if (selectedTags.length >= 5) {
      setError('Maksimal 5 tag');
      return;
    }

    setSelectedTags((prev) => [...prev, trimmedTag]);
    setCustomTag('');
    setError('');
  };

  const removeTag = (tagToRemove: string) => {
    setSelectedTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
      router.push('/login');
      return;
    }

    // Validasi title
    if (!title || title.trim().length < 10) {
      setError('Judul pertanyaan minimal 10 karakter');
      return;
    }

    // Validasi content
    if (!content || content.trim().length < 20) {
      setError('Isi pertanyaan minimal 20 karakter');
      return;
    }

    // Tag is optional now, but if provided must be valid
    if (selectedTags.length > 5) {
      setError('Maksimal 5 tag');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await questionAPI.create({
        title,
        content,
        tags: selectedTags,
        community_slug: communitySlug || undefined,
        images: images.map(img => img.url), // Add image URLs
      });

      // Get question ID from response
      const questionData = response.data.data?.question || response.data.data;
      const questionId = questionData?.id;

      if (!questionId) {
        throw new Error('Question ID not found in response');
      }

      router.push(`/questions/${questionId}`);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Gagal membuat pertanyaan');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 space-y-4">
              <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded"></div>
              <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded"></div>
              <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded"></div>
              <div className="flex justify-end">
                <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-32"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Kembali</span>
        </button>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 mb-8 shadow-sm">
          <p className="inline-flex items-center gap-2 text-sm text-emerald-600 font-semibold">
            <HelpCircle className="w-4 h-4" />
            Formulir Pertanyaan
          </p>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-3">Tanyakan Masalah Bisnis Anda</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            Jelaskan kendala secara spesifik agar mentor dan pelaku usaha lain bisa memberikan solusi
            terbaik. Sertakan data yang relevan, konteks usaha, dan langkah yang sudah Anda coba.
          </p>
          {communitySlug && (
            <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <p className="text-sm text-emerald-700">
                📍 Pertanyaan ini akan diposting di komunitas <span className="font-semibold">{communitySlug}</span>
              </p>
            </div>
          )}
          {!communitySlug && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                💡 <span className="font-semibold">Tips:</span> Untuk bertanya di komunitas spesifik, klik tombol "Buat Pertanyaan" dari halaman komunitas tersebut
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Error</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Judul Pertanyaan <span className="text-red-500">*</span>
              </label>
              <span className={`text-xs ${title.length < 10 ? 'text-red-500' : 'text-emerald-600'}`}>
                {title.length < 10
                  ? `${title.length}/10 karakter`
                  : `${title.length}/200 karakter`}
              </span>
            </div>
            <input
              id="title"
              name="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Strategi pemasaran digital untuk meningkatkan penjualan harian"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="content" className="block text-sm font-medium text-slate-700">
                Detail Pertanyaan <span className="text-red-500">*</span>
              </label>
              <span className={`text-xs ${content.length < 20 ? 'text-red-500' : 'text-emerald-600'}`}>
                {content.length < 20
                  ? `${content.length}/20 karakter`
                  : `${content.length}/5000 karakter`}
              </span>
            </div>
            <MentionInput
              value={content}
              onChange={setContent}
              placeholder="Jelaskan latar belakang bisnis, masalah utama, data pendukung, dan solusi yang sudah dicoba... Ketik @ untuk mention user atau paste link"
              className="text-sm"
              minRows={8}
              maxRows={20}
              disabled={loading}
            />
            <p className="text-xs text-slate-500 mt-1">
              Gunakan paragraf singkat, bullet point, atau angka untuk memudahkan pembaca. Ketik @ untuk mention user.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Gambar Pendukung (Opsional)
            </label>
            <ImageUpload
              onImagesChange={setImages}
              maxImages={5}
              userId={user?.id || ''}
              disabled={loading}
            />
            <p className="text-xs text-slate-500 mt-1">
              Upload gambar untuk memperjelas masalah (grafik, screenshot, foto produk, dll)
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-slate-700">
                Tag (Opsional)
              </label>
              <p className="text-xs text-slate-500">
                {selectedTags.length}/5 tag
              </p>
            </div>

            {/* Selected Tags Display */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                {selectedTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600 text-white text-sm font-medium"
                  >
                    <Tag className="w-3.5 h-3.5" />
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:bg-emerald-700 rounded-full p-0.5 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Custom Tag Input */}
            <div className="mb-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomTag();
                    }
                  }}
                  placeholder="Ketik tag custom (contoh: startup, fintech)"
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  disabled={selectedTags.length >= 5}
                />
                <button
                  type="button"
                  onClick={addCustomTag}
                  disabled={selectedTags.length >= 5 || !customTag.trim()}
                  className="w-full sm:w-auto px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-sm font-medium transition-colors whitespace-nowrap"
                >
                  Tambah
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Tekan Enter atau klik Tambah untuk menambahkan tag custom
              </p>
            </div>

            {/* Suggested Tags */}
            <div>
              <p className="text-xs font-medium text-slate-600 mb-2">Tag yang disarankan:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    disabled={!selectedTags.includes(tag) && selectedTags.length >= 5}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-colors ${selectedTags.includes(tag)
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : !selectedTags.includes(tag) && selectedTags.length >= 5
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-400 hover:text-emerald-600'
                      }`}
                  >
                    <Tag className="w-3.5 h-3.5" />
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-emerald-900">Tips Pertanyaan Berkualitas</p>
                <ul className="text-xs text-emerald-700 mt-2 space-y-1 list-disc list-inside">
                  <li>Jelaskan masalah dengan spesifik dan detail</li>
                  <li>Sertakan data atau angka pendukung jika ada</li>
                  <li>Ceritakan apa yang sudah Anda coba</li>
                  <li>Gunakan tag yang relevan agar mudah ditemukan</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors font-medium"
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || selectedTags.length === 0}
              className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>Posting Pertanyaan</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
