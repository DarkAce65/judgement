import { ComponentType, useCallback, useState } from 'react';

import useIsMounted from '../utils/useIsMounted';

import PlayerNameModal from './PlayerNameModal';

export interface WithPromptPlayerNameProps {
  promptPlayerName: () => Promise<void>;
}

const withPromptPlayerName = <P extends object>(
  WrappedComponent: ComponentType<P & WithPromptPlayerNameProps>
) => {
  const PromptPlayerName = (props: P) => {
    const isMounted = useIsMounted();

    const [promiseHandlers, setPromiseHandlers] = useState<{
      resolve: () => void;
      reject: () => void;
    } | null>(null);

    const promptPlayerName = useCallback(() => {
      const promise = new Promise<void>((resolve, reject) => {
        if (isMounted.current) {
          setPromiseHandlers({ resolve, reject });
        }
      });

      return promise;
    }, [isMounted]);

    return (
      <>
        <WrappedComponent {...props} promptPlayerName={promptPlayerName} />
        <PlayerNameModal
          open={promiseHandlers !== null}
          onOk={() => {
            promiseHandlers?.resolve();
            setPromiseHandlers(null);
          }}
          onCancel={() => {
            promiseHandlers?.reject();
            setPromiseHandlers(null);
          }}
        />
      </>
    );
  };

  return PromptPlayerName;
};

export default withPromptPlayerName;
