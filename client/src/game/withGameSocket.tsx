import { ComponentType } from 'react';

import { Socket } from 'socket.io-client';

import useGameSocket from './useGameSocket';

export interface WithGameSocketProps {
  socket: Socket;
  namespace: string;
}

const withGameSocket = <P,>(WrappedComponent: ComponentType<P & WithGameSocketProps>) => {
  const ComponentWithGameSocket = (props: P) => {
    const { socket, namespace } = useGameSocket();

    if (socket === null || namespace === null) {
      return null;
    }

    return <WrappedComponent socket={socket} namespace={namespace} {...props} />;
  };

  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  ComponentWithGameSocket.displayName = `withGameSocket(${displayName})`;

  return ComponentWithGameSocket;
};

export default withGameSocket;
