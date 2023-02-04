import { RefObject, useEffect, useRef } from 'react';

const useIsMounted = (): RefObject<boolean> => {
  const isMounted = useRef(false);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  return isMounted;
};

export default useIsMounted;
