import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';

interface HighlightedArticle {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  image_url: string | null;
  published_at: string;
}

interface HighlightedEvent {
  id: number;
  public_id: string;
  title: string;
  description: string;
  image_url: string | null;
  start_date: string;
  end_date: string;
  location_type: string;
}

interface HighlightedContent {
  article: HighlightedArticle | null;
  event: HighlightedEvent | null;
}

export function useHighlightedContent() {
  const [content, setContent] = useState<HighlightedContent>({ article: null, event: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const locale = useLocale();

  useEffect(() => {
    const fetchHighlightedContent = async () => {
      try {
        setLoading(true);
        
        // Fetch highlighted article and event in parallel
        const [articleResponse, eventResponse] = await Promise.all([
          fetch(`/api/public/articles?highlighted=true`, {
            headers: { 'locale': locale }
          }),
          fetch(`/api/events?locale=${locale}&highlighted=true&limit=1`)
        ]);

        const articleData = await articleResponse.json();
        const eventData = await eventResponse.json();

        setContent({
          article: articleData.data?.[0] || null,
          event: eventData.data?.[0] || null,
        });
      } catch (err) {
        console.error('Error fetching highlighted content:', err);
        setError('Failed to load featured content');
      } finally {
        setLoading(false);
      }
    };

    fetchHighlightedContent();
  }, [locale]);

  return { content, loading, error };
}
