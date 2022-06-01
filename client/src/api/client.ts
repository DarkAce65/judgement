import { Socket, io } from 'socket.io-client';

import { join } from '../utils/url';

const API_HOST = import.meta.env.VITE_APP_API_HOST?.replace(/\/+$/, '') ?? '';
const API_ROOT = import.meta.env.VITE_APP_API_ROOT?.replace(/\/+$/, '') ?? '';

const API_BASE = join(API_HOST, API_ROOT);

const WEBSOCKET_PATH = join(API_ROOT, '/ws/socket.io');

type SocketParams = Exclude<Parameters<typeof io>[1], undefined>;

export const buildSocket = (params?: SocketParams, namespace = ''): Socket => {
  const socketParams: SocketParams = {
    path: WEBSOCKET_PATH,
    ...params,
    ...(import.meta.env.DEV && { withCredentials: true }),
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

export const makeJSONBodyWithContentType = (body: unknown) => ({
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

export const fetchAPI = (
  path: string,
  init?: RequestInit & { additionalSuccessStatusCodes?: number[] }
): Promise<Response> => {
  const requestPath = buildRequestPath(path);
  const requestInit: RequestInit = {
    ...(import.meta.env.DEV && { credentials: 'include' }),
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
