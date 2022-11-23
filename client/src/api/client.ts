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

export interface FetchAPIOptions {
  method?: RequestInit['method'];
  data?: unknown;
  additionalSuccessStatusCodes?: number[];
  requestOptions?: Omit<RequestInit, 'body' | 'method'>;
}

export const buildRequestPath = (path: string): string => {
  if (path.length > 0) {
    return `${API_BASE}/${path.replace(/^\/+/, '')}`;
  }

  return API_BASE;
};

const buildRequestInit = (options: FetchAPIOptions): RequestInit => {
  const requestInit: RequestInit = {
    ...options.requestOptions,
    method: options.method,
  };
  if (options.data) {
    requestInit['headers'] = {
      ...requestInit['headers'],
      'Content-Type': 'application/json',
    };
    requestInit['body'] = JSON.stringify(options.data);
  }
  if (import.meta.env.DEV) {
    requestInit['credentials'] = 'include';
  }

  return requestInit;
};

export const fetchAPI = (path: string, options?: FetchAPIOptions): Promise<Response> => {
  const requestPath = buildRequestPath(path);

  let request;
  if (options) {
    request = fetch(requestPath, buildRequestInit(options));
  } else {
    request = fetch(requestPath);
  }

  return request.then((response) => {
    if (response.ok || options?.additionalSuccessStatusCodes?.indexOf(response.status) !== -1) {
      return response;
    }

    return Promise.reject(response);
  });
};
