import { useEffect, useState } from 'react';

import { FetchStatus } from './FetchStatus';
import { fetchAPI } from './client';

const useFetch = <R>(...args: Parameters<typeof fetchAPI>) => {
  const [status, setStatus] = useState<FetchStatus>('uninitialized');
  const [response, setResponse] = useState<R | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    setStatus('pending');
    setResponse(null);
    setError(null);

    fetchAPI(...args)
      .then((r) => r.json())
      .then((r) => {
        setResponse(r);
        setStatus('succeeded');
      })
      .catch((e) => {
        setError(e);
        setStatus('failed');
      });
  }, [...args]); // eslint-disable-line react-hooks/exhaustive-deps

  return { status, response, error };
};

export default useFetch;
