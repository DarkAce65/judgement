import { Socket, io } from 'socket.io-client';

import isDev from '../utils/isDev';
import { join } from '../utils/url';

const API_HOST = process.env.REACT_APP_API_HOST?.replace(/\/+$/, '') ?? '';
const API_ROOT = process.env.REACT_APP_API_ROOT?.replace(/\/+$/, '') ?? '';

const API_BASE = join(API_HOST, API_ROOT);

const WEBSOCKET_PATH = join(API_ROOT, '/ws/socket.io');

type SocketParams = Exclude<Parameters<typeof io>[1], undefined>;

export const buildSocket = (params?: SocketParams, namespace = ''): Socket => {
  const socketParams: SocketParams = {
    path: WEBSOCKET_PATH,
    ...params,
    ...(isDev && { withCredentials: true }),
  };

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

export const fetchAPI = (
  path: string,
  init?: RequestInit & { additionalSuccessStatusCodes?: number[] }
): Promise<Response> => {
  const requestPath = buildRequestPath(path);
  const requestInit: RequestInit = {
    ...(isDev && { credentials: 'include' }),
    ...init,
  };

  let request;
  if (Object.keys(requestInit).length === 0) {
    request = fetch(requestPath);
  } else {
    request = fetch(requestPath, requestInit);
  }

  const additionalSuccessStatusCodes =
    init && init.additionalSuccessStatusCodes !== undefined
      ? init.additionalSuccessStatusCodes
      : [];
  return request.then((response) => {
    if (response.ok || additionalSuccessStatusCodes.indexOf(response.status) !== -1) {
      return response;
    }

    return Promise.reject(response);
  });
};
