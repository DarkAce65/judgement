import { EffectCallback, useEffect } from 'react';

const useMountEffect = (f: EffectCallback): void => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useEffect(f, []);
};

export default useMountEffect;
