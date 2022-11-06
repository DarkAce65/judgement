import { useMemo } from 'react';

import useWindowSize from '../../utils/useWindowSize';

export const useCardWidth = () => {
  const { width } = useWindowSize();
  return useMemo(() => Math.min(Math.max(100, width / 6), 175), [width]);
};
