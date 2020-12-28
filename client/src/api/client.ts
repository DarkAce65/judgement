const getAPIRoot = (): string => process.env.REACT_APP_API_ROOT ?? '/';

export const fetchAPI = (path: string, init?: RequestInit): Promise<Response> =>
  fetch(`${getAPIRoot()}${path}`, init);
