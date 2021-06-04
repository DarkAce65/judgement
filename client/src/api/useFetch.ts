import { useCallback, useEffect, useRef, useState } from 'react';

import isEqual from 'lodash-es/isEqual';

import { FetchStatus } from './FetchStatus';
import { fetchAPI } from './client';

interface FetchOptions {
  fetchOnMount?: boolean;
  fetchOnArgsChange?: boolean;
  skip?: boolean;
}

interface FetchResponse {
  status: FetchStatus;
  response: Response | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any;

  triggerFetch: () => void;
}

const useFetch = (
  fetchArgs: Parameters<typeof fetchAPI>,
  { fetchOnMount = false, fetchOnArgsChange = false, skip = false }: FetchOptions = {}
): FetchResponse => {
  const [status, setStatus] = useState<FetchStatus>('uninitialized');
  const [response, setResponse] = useState<Response | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [error, setError] = useState<any>(null);

  const firstRun = useRef(true);
  const previousArgs = useRef(fetchArgs);

  const triggerFetch = useCallback(() => {
    setStatus('pending');
    setResponse(null);
    setError(null);

    fetchAPI(...fetchArgs)
      .then((r) => {
        setResponse(r);
        setStatus('succeeded');
      })
      .catch((e) => {
        setError(e);
        setStatus('failed');
      });
  }, [fetchArgs]);

  useEffect(() => {
    if (skip) {
      return;
    }

    const isFirstRun = firstRun.current;
    const isSame = previousArgs.current.every((arg, index) => isEqual(arg, fetchArgs[index]));

    firstRun.current = false;
    previousArgs.current = fetchArgs;

    if ((fetchOnMount && isFirstRun) || (fetchOnArgsChange && !isSame)) {
      triggerFetch();
    }
  }, [skip, fetchArgs, fetchOnArgsChange, fetchOnMount, triggerFetch]);

  return { status, response, error, triggerFetch };
};

export default useFetch;
