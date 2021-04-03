import { useEffect, useRef, useState } from 'react';

import isEqual from 'lodash-es/isEqual';

import { FetchStatus } from './FetchStatus';
import { fetchAPI } from './client';

const useFetch = (...args: Parameters<typeof fetchAPI>) => {
  const [status, setStatus] = useState<FetchStatus>('uninitialized');
  const [response, setResponse] = useState<Response | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [error, setError] = useState<any>(null);

  const firstRun = useRef(true);
  const previousArgs = useRef(args);
  useEffect(() => {
    const isFirstRun = firstRun.current;
    const isSame = previousArgs.current.every((arg, index) => isEqual(arg, args[index]));

    firstRun.current = false;
    previousArgs.current = args;

    if (!isFirstRun && isSame) {
      return;
    }

    setStatus('pending');
    setResponse(null);
    setError(null);

    fetchAPI(...args)
      .then((r) => {
        setResponse(r);
        setStatus('succeeded');
      })
      .catch((e) => {
        setError(e);
        setStatus('failed');
      });
  }, [args]);

  return { status, response, error };
};

export default useFetch;
