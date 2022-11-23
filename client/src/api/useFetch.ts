import { useCallback, useEffect, useRef, useState } from 'react';

import isEqual from 'lodash-es/isEqual';

import { FetchStatus } from './FetchStatus';
import { FetchAPIOptions, fetchAPI } from './client';

interface FetchOptions {
  fetchOnMount?: boolean;
  fetchOnArgsChange?: boolean;
  skip?: boolean;
  apiOptions?: FetchAPIOptions;
}

interface FetchResponse<T = unknown> {
  status: FetchStatus;
  response: Response | null;
  data: T | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any;

  triggerFetch: () => void;
}

const useFetch = <T>(
  path: string,
  { fetchOnMount = true, fetchOnArgsChange = true, skip = false, apiOptions }: FetchOptions = {}
): FetchResponse<T> => {
  const [status, setStatus] = useState<FetchStatus>('uninitialized');
  const [response, setResponse] = useState<Response | null>(null);
  const [data, setData] = useState<T | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [error, setError] = useState<any>(null);

  const firstRun = useRef(true);
  const previousArgs = useRef([path, apiOptions] as const);

  const triggerFetch = useCallback(() => {
    setStatus('pending');
    setResponse(null);
    setData(null);
    setError(null);

    fetchAPI(path, apiOptions)
      .then(async (r) => {
        setData((await r.json()) as T);
        setResponse(r);
        setStatus('succeeded');
      })
      .catch((e) => {
        setError(e);
        setStatus('failed');
      });
  }, [apiOptions, path]);

  useEffect(() => {
    if (skip) {
      return;
    }

    const isFirstRun = firstRun.current;
    const isSame =
      isEqual(previousArgs.current[0], path) && isEqual(previousArgs.current[1], apiOptions);

    firstRun.current = false;
    previousArgs.current = [path, apiOptions];

    if ((fetchOnMount && isFirstRun) || (fetchOnArgsChange && !isSame)) {
      triggerFetch();
    }
  }, [apiOptions, fetchOnArgsChange, fetchOnMount, path, skip, triggerFetch]);

  return { status, response, data, error, triggerFetch };
};

export default useFetch;
