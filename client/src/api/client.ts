const getAPIHost = (): string | null => process.env.REACT_APP_API_HOST?.replace(/\/+$/, '') ?? null;

const getAPIRoot = (): string | null => process.env.REACT_APP_API_ROOT?.replace(/\/+$/, '') ?? null;

const buildAPIRequestBase = (): string => {
  const apiBase = [];
  const apiHost = getAPIHost();
  if (apiHost !== null && apiHost.length > 0) {
    apiBase.push(apiHost);
  }

  const apiRoot = getAPIRoot();
  if (apiRoot !== null && apiRoot.length > 0) {
    apiBase.push(apiRoot);
  }

  return apiBase.join('/');
};

export const buildRequestPath = (path: string): string => {
  if (path.length > 0) {
    return `${buildAPIRequestBase()}/${path.replace(/^\/+/, '')}`;
  }

  return buildAPIRequestBase();
};
