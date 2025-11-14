'use client';

import { FormEvent, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { HelpCircle, Tag, Lightbulb, AlertCircle, ArrowLeft } from 'lucide-react';
import api, { questionAPI } from '@/lib/api';

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
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [communitySlug, setCommunitySlug] = useState('');
  const [communities, setCommunities] = useState<any[]>([]);
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
    
    // Fetch user's communities
    fetchCommunities();
  }, [searchParams]);

  const fetchCommunities = async () => {
    try {
      const response = await api.get('/communities?member=true');
      setCommunities(response.data.data.communities || []);
    } catch (error) {
      console.error('Error fetching communities:', error);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag],
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!user) {
      router.push('/login');
      return;
    }

    if (selectedTags.length === 0) {
      setError('Pilih minimal 1 tag');
      return;
    }

    if (selectedTags.length > 3) {
      setError('Maksimal 3 tag yang dapat dipilih');
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
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            <div className="bg-white rounded-2xl p-6 space-y-4">
              <div className="h-10 bg-slate-200 rounded"></div>
              <div className="h-40 bg-slate-200 rounded"></div>
              <div className="h-10 bg-slate-200 rounded"></div>
              <div className="flex justify-end">
                <div className="h-10 bg-slate-200 rounded w-32"></div>
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
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Kembali</span>
        </button>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-8 shadow-sm">
          <p className="inline-flex items-center gap-2 text-sm text-emerald-600 font-semibold">
            <HelpCircle className="w-4 h-4" />
            Formulir Pertanyaan
          </p>
          <h1 className="text-3xl font-bold text-slate-900 mt-3">Tanyakan Masalah Bisnis Anda</h1>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            Jelaskan kendala secara spesifik agar mentor dan pelaku usaha lain bisa memberikan solusi
            terbaik. Sertakan data yang relevan, konteks usaha, dan langkah yang sudah Anda coba.
          </p>
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
          className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm"
        >
          <div>
            <label htmlFor="community" className="block text-sm font-medium text-slate-700 mb-2">
              Komunitas (Opsional)
            </label>
            <select
              id="community"
              name="community"
              value={communitySlug}
              onChange={(e) => setCommunitySlug(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
            >
              <option value="">Semua Komunitas / Umum</option>
              {communities.map((community) => (
                <option key={community.id} value={community.slug}>
                  {community.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-1">
              Pilih komunitas jika pertanyaan Anda spesifik untuk komunitas tersebut
            </p>
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">
              Judul Pertanyaan <span className="text-red-500">*</span>
            </label>
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
            <label htmlFor="content" className="block text-sm font-medium text-slate-700 mb-2">
              Detail Pertanyaan <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              name="content"
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Jelaskan latar belakang bisnis, masalah utama, data pendukung, dan solusi yang sudah dicoba..."
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              required
            />
            <p className="text-xs text-slate-500 mt-1">
              Gunakan paragraf singkat, bullet point, atau angka untuk memudahkan pembaca.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-slate-700">
                Pilih Tag Relevan <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-slate-500">
                {selectedTags.length}/3 tag dipilih
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestedTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  disabled={!selectedTags.includes(tag) && selectedTags.length >= 3}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : !selectedTags.includes(tag) && selectedTags.length >= 3
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-emerald-400'
                  }`}
                >
                  <Tag className="w-4 h-4" />
                  {tag}
                </button>
              ))}
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
