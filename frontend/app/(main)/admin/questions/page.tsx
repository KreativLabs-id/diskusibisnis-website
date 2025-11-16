'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminAPI } from '@/lib/api';
import { MessageSquare, ArrowLeft, Search, Trash2, Eye, ThumbsUp, ThumbsDown, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import AlertModal from '@/components/ui/AlertModal';
import ConfirmModal from '@/components/ui/ConfirmModal';

interface Question {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  views: number;
  author_name: string;
  author_email: string;
  answer_count: number;
  upvotes: number;
  downvotes: number;
}

export default function AdminQuestions() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  }>({ isOpen: false, type: 'info', title: '', message: '' });
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  const showAlert = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    setAlertModal({ isOpen: true, type, title, message });
  };

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/');
      return;
    }

    if (user && user.role === 'admin') {
      fetchQuestions();
    }
  }, [user, loading, router]);

  const fetchQuestions = async () => {
    try {
      setQuestionsLoading(true);
      const response = await adminAPI.getQuestions();
      setQuestions(response.data.data.questions);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setQuestionsLoading(false);
    }
  };

  const handleDeleteQuestion = (questionId: string, title: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Question',
      message: `Are you sure you want to delete the question "${title}"? This action cannot be undone and will also delete all answers and votes.`,
      onConfirm: async () => {
        try {
          await adminAPI.deleteQuestion(questionId);
          showAlert('success', 'Success', 'Question has been deleted');
          fetchQuestions(); // Refresh the list
        } catch (error) {
          console.error('Error deleting question:', error);
          showAlert('error', 'Error', 'Failed to delete question');
        }
      }
    });
  };

  const filteredQuestions = questions.filter(q => 
    q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.author_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link
            href="/admin"
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <MessageSquare className="w-6 h-6 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Question Management</h1>
          </div>
        </div>
        <p className="text-slate-600">Review and moderate questions posted by users</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search questions by title, content, or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {questionsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No questions found
          </div>
        ) : (
          filteredQuestions.map((question) => (
            <div key={question.id} className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-slate-900 hover:text-green-600">
                      <Link href={`/questions/${question.id}`} target="_blank">
                        {question.title}
                      </Link>
                    </h3>
                  </div>
                  
                  <p className="text-slate-600 mb-4">
                    {truncateText(question.content, 200)}
                  </p>
                  
                  <div className="flex items-center gap-6 text-sm text-slate-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{question.views} views</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>{question.answer_count} answers</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="w-4 h-4 text-green-600" />
                      <span>{question.upvotes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsDown className="w-4 h-4 text-red-600" />
                      <span>{question.downvotes}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-500">
                      <span className="font-medium">{question.author_name}</span>
                      <span className="mx-2">•</span>
                      <span>{new Date(question.created_at).toLocaleDateString()}</span>
                      {question.updated_at !== question.created_at && (
                        <>
                          <span className="mx-2">•</span>
                          <span>Updated {new Date(question.updated_at).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <Link
                    href={`/questions/${question.id}`}
                    target="_blank"
                    className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                    title="View question"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDeleteQuestion(question.id, question.title)}
                    className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                    title="Delete question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      <div className="mt-6 text-sm text-slate-500">
        Showing {filteredQuestions.length} of {questions.length} questions
      </div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        type={alertModal.type}
        title={alertModal.title}
        message={alertModal.message}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type="danger"
      />
    </div>
  );
}
