export const getBackendHost = (): string | null =>
  process.env.REACT_APP_BACKEND_HOST?.replace(/\/+$/, '') ?? null;

export const getAPIBase = (): string => {
  const apiBase = [];
  const backendHost = getBackendHost();
  if (backendHost !== null && backendHost.length > 0) {
    apiBase.push(backendHost);
  }

  const apiRoot = process.env.REACT_APP_API_ROOT?.replace(/^\/+/, '').replace(/\/+$/, '');
  if (apiRoot && apiRoot.length > 0) {
    apiBase.push(apiRoot);
  }

  return apiBase.join('/');
};

export const buildRequestPath = (path: string): string => {
  const requestPath = [getAPIBase()];

  if (path.length > 0) {
    requestPath.push(path.replace(/^\/+/, ''));
  }

  return requestPath.join('/');
};
