import { ManagerOptions, Socket, SocketOptions, io } from 'socket.io-client';

import isDev from '../utils/isDev';
import { join } from '../utils/url';

const API_HOST = process.env.REACT_APP_API_HOST?.replace(/\/+$/, '') ?? '';
const API_ROOT = process.env.REACT_APP_API_ROOT?.replace(/\/+$/, '') ?? '';

const API_BASE = join(API_HOST, API_ROOT);

const WEBSOCKET_PATH = join(API_ROOT, '/ws/socket.io');

export const buildSocket = (namespace = ''): Socket => {
  const socketParams: Partial<ManagerOptions & SocketOptions> = { path: WEBSOCKET_PATH };

  let socket;
  if (API_HOST.length > 0 && namespace.length > 0) {
    socket = io(join(API_HOST, namespace), socketParams);
  } else if (API_HOST.length > 0) {
    socket = io(API_HOST, socketParams);
  } else if (namespace.length > 0) {
    socket = io(namespace, socketParams);
  } else {
    socket = io(socketParams);
  }

  return socket;
};

export const buildRequestPath = (path: string): string => {
  if (path.length > 0) {
    return `${API_BASE}/${path.replace(/^\/+/, '')}`;
  }

  return API_BASE;
};

export const fetchAPI = (path: string, init?: RequestInit): Promise<Response> => {
  const requestPath = buildRequestPath(path);
  const requestInit: RequestInit = {
    ...(isDev && { credentials: 'include' }),
    ...init,
  };

  if (Object.keys(requestInit).length === 0) {
    return fetch(requestPath);
  }

  return fetch(requestPath, requestInit);
};
