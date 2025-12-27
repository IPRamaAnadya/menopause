
import { useState, useCallback } from 'react';
import { useLocale } from 'next-intl';


interface UseFetchOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export function useFetch<T = any>(url: string, options?: UseFetchOptions) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const locale = useLocale();


  const fetchData = useCallback(async (customOptions?: UseFetchOptions) => {
    setLoading(true);
    setError(null);
    try {
      // Merge headers and ensure locale is set from next-intl
      const mergedHeaders = {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
        ...(customOptions?.headers || {}),
        locale: (customOptions?.headers?.locale || locale),
      };
      const response = await fetch(url, {
        method: customOptions?.method || options?.method || 'GET',
        headers: mergedHeaders,
        body: customOptions?.body || options?.body ? JSON.stringify(customOptions?.body || options?.body) : undefined,
      });
      const result = await response.json();
      setData(result);
      customOptions?.onSuccess?.(result);
      options?.onSuccess?.(result);
    } catch (err) {
      setError(err);
      customOptions?.onError?.(err);
      options?.onError?.(err);
    } finally {
      setLoading(false);
    }
  }, [url, options, locale]);

  return { data, error, loading, fetchData };
}

// Usage:
// const { data, error, loading, fetchData } = useFetch('/api/something');
// useEffect(() => { fetchData(); }, []);
// fetchData({ method: 'POST', body: { ... } });
