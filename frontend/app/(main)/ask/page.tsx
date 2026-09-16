'use client';

import { FormEvent, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Lightbulb, AlertCircle, ArrowLeft, X } from 'lucide-react';
import { questionAPI } from '@/lib/api';
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
  const [showTips, setShowTips] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('dismiss_ask_tips') !== 'true';
    }
    return false;
  });

  const handleDismissTips = () => {
    setShowTips(false);
    sessionStorage.setItem('dismiss_ask_tips', 'true');
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
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

    if (!title || title.trim().length < 10) {
      setError('Judul pertanyaan minimal 10 karakter');
      return;
    }

    if (!content || content.trim().length < 20) {
      setError('Isi pertanyaan minimal 20 karakter');
      return;
    }

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
        images: images.map(img => img.url),
      });

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
      <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 transition-colors duration-200">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/4"></div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 space-y-4 border border-slate-200 dark:border-slate-800">
              <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
              <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
              <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
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
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 transition-colors duration-200 pb-20">
      <div className="max-w-3xl mx-auto px-4 py-4 sm:py-8">
        {/* Clean Header with Back button and Tips toggle */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="p-1.5 -ml-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg transition-colors"
              aria-label="Kembali"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Buat Pertanyaan
              </h1>
              {communitySlug && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  Diposting di komunitas #{communitySlug}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowTips(!showTips)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
              showTips
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>Tips Menulis</span>
          </button>
        </div>

        {/* Dismissible Tips Banner */}
        {showTips && (
          <div className="mb-4 p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-600 dark:text-slate-300 shadow-xs flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5 min-w-0">
              <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-slate-900 dark:text-white">Panduan singkat agar mendapat solusi terbaik:</p>
                <ul className="text-slate-500 dark:text-slate-400 list-disc list-inside space-y-0.5">
                  <li>Tulis judul yang jelas dan spesifik.</li>
                  <li>Sertakan konteks bisnis atau data pendukung.</li>
                  <li>Ceritakan kendala dan apa yang sudah dicoba.</li>
                </ul>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDismissTips}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg shrink-0"
              aria-label="Tutup tips"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl p-3 mb-4 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Single Cohesive Form Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-xs"
        >
          {/* Judul Pertanyaan */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="title" className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                Judul Pertanyaan <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                {title.length}/200
              </span>
            </div>
            <input
              id="title"
              name="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Apa kendala atau pertanyaan bisnis Anda?"
              className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm text-slate-900 dark:text-white placeholder:text-slate-400"
              required
            />
          </div>

          {/* Detail Pertanyaan */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="content" className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                Detail Pertanyaan <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                {content.length}/5000
              </span>
            </div>
            <div className="border border-slate-200 dark:border-slate-800 dark:bg-slate-900 rounded-xl focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all overflow-hidden bg-white">
              <MentionInput
                value={content}
                onChange={setContent}
                placeholder="Jelaskan kendala bisnis, data pendukung, atau solusi yang sudah dicoba..."
                className="text-sm text-slate-900 dark:text-white placeholder:text-slate-400"
                minRows={6}
                maxRows={16}
                disabled={loading}
              />
            </div>
          </div>

          {/* Gambar Pendukung */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
              Gambar Pendukung <span className="text-slate-400 font-normal text-xs">(Opsional)</span>
            </label>
            <ImageUpload
              onImagesChange={setImages}
              maxImages={5}
              userId={user?.id || ''}
              disabled={loading}
            />
          </div>

          {/* Tag */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                Tag <span className="text-slate-400 font-normal text-xs">(Opsional, maks. 5)</span>
              </label>
              {selectedTags.length > 0 && (
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  {selectedTags.length}/5 dipilih
                </span>
              )}
            </div>

            {/* Selected Tags Display */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {selectedTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 text-xs font-semibold"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="p-0.5 hover:bg-emerald-200/50 dark:hover:bg-emerald-900 rounded-md transition-colors"
                      aria-label={`Hapus tag ${tag}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Custom Tag Input with inline Tambah button */}
            <div className="relative flex items-center">
              <input
                type="text"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomTag();
                  }
                }}
                placeholder="Ketik tag custom..."
                className="w-full pl-3.5 pr-20 py-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400"
                disabled={selectedTags.length >= 5}
              />
              <button
                type="button"
                onClick={addCustomTag}
                disabled={selectedTags.length >= 5 || !customTag.trim()}
                className="absolute right-1.5 px-3 py-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-40 text-xs font-semibold transition-colors"
              >
                Tambah
              </button>
            </div>

            {/* Suggested Tags */}
            <div className="mt-2.5">
              <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mb-1.5">Saran topik:</p>
              <div className="flex flex-wrap gap-1.5">
                {suggestedTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      disabled={!isSelected && selectedTags.length >= 5}
                      className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${
                        isSelected
                          ? 'bg-emerald-600 text-white font-medium'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      #{tag}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="px-4 py-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium transition-colors"
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || title.trim().length < 10 || content.trim().length < 20}
              className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 text-xs sm:text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm shadow-emerald-600/20"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent"></div>
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
