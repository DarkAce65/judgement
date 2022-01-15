import { ComponentType, useEffect, useState } from 'react';

import { Socket } from 'socket.io-client';

import GameSocket from './GameSocket';

export interface WithGameSocketProps {
  socket: Socket;
  namespace: string;
}

const withGameSocket = <P,>(WrappedComponent: ComponentType<P & WithGameSocketProps>) => {
  const ComponentWithGameSocket = (props: P) => {
    const [socketAndNamespace, setSocketAndNamespace] = useState<WithGameSocketProps | null>(null);

    useEffect(() => {
      const { socket, namespace } = GameSocket.attach();
      setSocketAndNamespace({ socket, namespace });

      return () => {
        GameSocket.detach(namespace);
      };
    }, []);

    if (socketAndNamespace === null) {
      return null;
    }

    return <WrappedComponent {...socketAndNamespace} {...props} />;
  };

  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  ComponentWithGameSocket.displayName = `withGameSocket(${displayName})`;

  return ComponentWithGameSocket;
};

export default withGameSocket;
