'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, X } from 'lucide-react';
import { questionAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import AlertModal from '@/components/ui/AlertModal';

interface QuestionData {
  id: string;
  title: string;
  content: string;
  author_id: string;
  tags: Array<{ id: string; name: string; slug: string }>;
}

export default function EditQuestionPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [question, setQuestion] = useState<QuestionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  }>({ isOpen: false, type: 'info', title: '', message: '' });

  const showAlert = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    setAlertModal({ isOpen: true, type, title, message });
  };

  useEffect(() => {
    const fetchQuestion = async () => {
      if (!params.id || params.id === 'undefined') {
        showAlert('error', 'Error', 'ID pertanyaan tidak valid');
        setTimeout(() => router.push('/'), 1500);
        return;
      }
      
      try {
        setLoading(true);
        const response = await questionAPI.getById(params.id as string);
        const questionData = response.data.data;
        
        // Check if user is the author
        if (!user || questionData.author_id !== user.id) {
          showAlert('error', 'Akses Ditolak', 'Anda tidak memiliki izin untuk mengedit pertanyaan ini');
          setTimeout(() => router.push(`/questions/${params.id}`), 1500);
          return;
        }
        
        setQuestion(questionData);
        setTitle(questionData.title);
        setContent(questionData.content);
        setTags(questionData.tags.map((tag: any) => tag.name));
      } catch (error) {
        console.error('Error fetching question:', error);
        showAlert('error', 'Gagal Memuat', 'Gagal memuat pertanyaan');
        setTimeout(() => router.push('/'), 1500);
      } finally {
        setLoading(false);
      }
    };

    if (params.id && params.id !== 'undefined' && user) {
      fetchQuestion();
    }
  }, [params.id, user, router]);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (!tags.includes(newTag) && tags.length < 5) {
        setTags([...tags, newTag]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      showAlert('warning', 'Data Tidak Lengkap', 'Judul dan konten tidak boleh kosong');
      return;
    }

    setSaving(true);
    try {
      await questionAPI.update(params.id as string, {
        title: title.trim(),
        content: content.trim(),
        tags
      });
      
      showAlert('success', 'Berhasil', 'Pertanyaan berhasil diperbarui');
      setTimeout(() => router.push(`/questions/${params.id}`), 1500);
    } catch (error) {
      console.error('Error updating question:', error);
      showAlert('error', 'Gagal Memperbarui', 'Gagal memperbarui pertanyaan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg border border-gray-200 p-8 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Pertanyaan tidak ditemukan</h2>
        <Link href="/" className="text-emerald-600 hover:text-emerald-700">
          Kembali ke beranda
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition-colors p-2 hover:bg-emerald-50 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Kembali</span>
        </button>
        <h1 className="text-2xl font-bold text-slate-900">Edit Pertanyaan</h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          {/* Title */}
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-semibold text-slate-700 mb-2">
              Judul Pertanyaan *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm"
              placeholder="Tulis judul pertanyaan yang jelas dan spesifik..."
              required
              maxLength={255}
            />
            <p className="text-xs text-slate-500 mt-1">
              {title.length}/255 karakter
            </p>
          </div>

          {/* Content */}
          <div className="mb-6">
            <label htmlFor="content" className="block text-sm font-semibold text-slate-700 mb-2">
              Detail Pertanyaan *
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm"
              placeholder="Jelaskan pertanyaan Anda secara detail. Sertakan konteks, apa yang sudah Anda coba, dan hasil yang diharapkan..."
              required
            />
          </div>

          {/* Tags */}
          <div className="mb-6">
            <label htmlFor="tags" className="block text-sm font-semibold text-slate-700 mb-2">
              Tag (Maksimal 5)
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:bg-emerald-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            {tags.length < 5 && (
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm"
                placeholder="Ketik tag dan tekan Enter (contoh: keuangan, marketing, pajak)"
              />
            )}
            <p className="text-xs text-slate-500 mt-1">
              Tekan Enter untuk menambah tag. Tag membantu orang lain menemukan pertanyaan Anda.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={saving || !title.trim() || !content.trim()}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </form>

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        type={alertModal.type}
        title={alertModal.title}
        message={alertModal.message}
      />
    </div>
  );
}
