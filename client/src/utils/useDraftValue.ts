import { useEffect, useState } from 'react';

type DraftValue<T> = [T, (value: T) => void, boolean];

const useDraftValue = <T>(actualValue: T): DraftValue<T> => {
  const [draftValue, setDraftValue] = useState(actualValue);

  useEffect(() => {
    setDraftValue(actualValue);
  }, [actualValue]);

  return [draftValue, setDraftValue, actualValue !== draftValue];
};

export default useDraftValue;
