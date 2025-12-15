import type { Metadata, ResolvingMetadata } from 'next';
import { questionAPI } from '@/lib/api';
import QuestionDetailClient, { QuestionData } from '@/components/pages/QuestionDetailClient';

interface Props {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

// Fetch helper with simple error handling for Server Side
async function getQuestion(id: string): Promise<QuestionData | null> {
  try {
    const response = await questionAPI.getById(id);
    // Handle different response structures if necessary, similar to client
    const rawQuestion = response.data.data;

    // Normalize logic duplicated from client to ensure consistent data shape
    return {
      ...rawQuestion,
      images: Array.isArray(rawQuestion.images)
        ? rawQuestion.images
        : typeof rawQuestion.images === 'string'
          ? (() => {
            try {
              const parsed = JSON.parse(rawQuestion.images);
              return Array.isArray(parsed) ? parsed : [];
            } catch {
              return [];
            }
          })()
          : [],
    };
  } catch (error) {
    // Log error but don't crash, allow client to try fetching
    console.warn(`[SEO] Failed fetching question ${id}:`, error);
    return null;
  }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const id = params.id;

  // Skip fetching for obvious non-ids to save resources
  if (id === 'undefined' || !id) {
    return {
      title: 'Pertanyaan - Diskusi Bisnis'
    }
  }

  const question = await getQuestion(id);

  if (!question) {
    return {
      title: 'Pertanyaan Tidak Ditemukan - Diskusi Bisnis',
      description: 'Pertanyaan yang Anda cari tidak ditemukan atau telah dihapus.',
    };
  }

  // Strip HTML tags for description
  const plainContent = (question.content || '').replace(/<[^>]*>/g, '').trim().substring(0, 160);

  return {
    title: `${question.title} - Diskusi Bisnis`,
    description: plainContent,
    openGraph: {
      title: question.title,
      description: plainContent,
      type: 'article',
      publishedTime: question.created_at,
      authors: [question.author_name],
      tags: question.tags?.map(t => t.name) || [],
    },
    twitter: {
      card: 'summary_large_image',
      title: question.title,
      description: plainContent,
    }
  };
}

export default async function QuestionDetailPage({ params }: Props) {
  const question = await getQuestion(params.id);

  return <QuestionDetailClient initialQuestion={question} questionId={params.id} />;
}
