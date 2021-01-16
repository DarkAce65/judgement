import { ManagerOptions, Socket, SocketOptions, io } from 'socket.io-client';

const getAPIHost = (): string => process.env.REACT_APP_API_HOST?.replace(/\/+$/, '') ?? '';
const getAPIRoot = (): string => process.env.REACT_APP_API_ROOT?.replace(/\/+$/, '') ?? '';

export const buildSocket = (namespace?: string): Socket => {
  const apiRoot = getAPIRoot();
  const socketParams: Partial<ManagerOptions & SocketOptions> = {
    path: `${apiRoot}/ws/socket.io`,
  };

  let socket;
  const apiHost = getAPIHost();
  if (apiHost.length > 0) {
    if (namespace) {
      socket = io(`${apiHost}/${namespace.replace(/^\/+/, '')}`, socketParams);
    } else {
      socket = io(apiHost, socketParams);
    }
  } else {
    if (namespace) {
      socket = io(namespace, socketParams);
    } else {
      socket = io(socketParams);
    }
  }

  return socket;
};

export const buildRequestPath = (path: string): string => {
  const apiBase = [];
  const apiHost = getAPIHost();
  if (apiHost.length > 0) {
    apiBase.push(apiHost);
  }

  const apiRoot = getAPIRoot();
  if (apiRoot.length > 0) {
    if (apiBase.length > 0) {
      apiBase.push(apiRoot.replace(/^\/+/, ''));
    } else {
      apiBase.push(apiRoot);
    }
  }

  const apiHostAndRoot = apiBase.join('/');

  if (path.length > 0) {
    return `${apiHostAndRoot}/${path.replace(/^\/+/, '')}`;
  }

  return apiHostAndRoot;
};
